# -*- coding: utf-8 -*-

"""
A simple library for managing the availability of ports.
"""

from __future__ import print_function, division

import time
import socket
import datetime
import argparse
import sys
import itertools
import contextlib
import collections
import textwrap
import warnings

from tempora import timing


def client_host(server_host):
	"""Return the host on which a client can connect to the given listener."""
	if server_host == '0.0.0.0':
		# 0.0.0.0 is INADDR_ANY, which should answer on localhost.
		return '127.0.0.1'
	if server_host in ('::', '::0', '::0.0.0.0'):
		# :: is IN6ADDR_ANY, which should answer on localhost.
		# ::0 and ::0.0.0.0 are non-canonical but common
		# ways to write IN6ADDR_ANY.
		return '::1'
	return server_host


def _getaddrinfo(host, port, *args, **kwargs):
	"""
	Provide a fallback when getaddrinfo fails.
	"""
	try:
		return socket.getaddrinfo(host, port, *args, **kwargs)
	except socket.gaierror:
		msg = textwrap.dedent("""
			This functionality is being considered for removal. If you
			encounter this message, please describe your use-case
			at https://github.com/jaraco/portend/issues/1.
			""").lstrip()
		warnings.warn(msg)
		host = client_host(host)
		if ':' in host:
			family = socket.AF_INET6
			addr = host, port, 0, 0
		else:
			family = socket.AF_INET
			addr = host, port
		item = family, socket.SOCK_STREAM, 0, "", addr
		return [item]


class Checker(object):
	def __init__(self, timeout=1.0):
		self.timeout = timeout

	def assert_free(self, host, port=None):
		"""
		Assert that the given addr is free
		in that all attempts to connect fail within the timeout
		or raise a PortNotFree exception.

		>>> free_port = find_available_local_port()

		>>> Checker().assert_free('localhost', free_port)
		>>> Checker().assert_free('127.0.0.1', free_port)
		>>> Checker().assert_free('::1', free_port)

		Also accepts an addr tuple

		>>> addr = '::1', free_port, 0, 0
		>>> Checker().assert_free(addr)
		"""
		if port is None and isinstance(host, collections.Sequence):
			host, port = host[:2]
		info = _getaddrinfo(host, port, socket.AF_UNSPEC, socket.SOCK_STREAM)
		list(itertools.starmap(self._connect, info))

	def _connect(self, af, socktype, proto, canonname, sa):
		s = socket.socket(af, socktype, proto)
		# fail fast with a small timeout
		s.settimeout(self.timeout)

		with contextlib.closing(s):
			try:
				s.connect(sa)
			except socket.error:
				return

		# the connect succeeded, so the port isn't free
		port, host = sa[:2]
		tmpl = "Port {port} is in use on {host}."
		raise PortNotFree(tmpl.format(**locals()))


class Timeout(IOError):
	pass


class PortNotFree(IOError):
	pass


def free(host, port, timeout=float('Inf')):
	"""
	Wait for the specified port to become free (dropping or rejecting
	requests). Return when the port is free or raise a Timeout if timeout has
	elapsed.

	Timeout may be specified in seconds or as a timedelta.
	If timeout is None or ∞, the routine will run indefinitely.

	>>> free('localhost', find_available_local_port())
	"""
	if not host:
		raise ValueError("Host values of '' or None are not allowed.")

	if isinstance(timeout, datetime.timedelta):
		timeout = timeout.total_seconds()

	if timeout is None:
		# treat None as infinite timeout
		timeout = float('Inf')

	watch = timing.Stopwatch()

	while total_seconds(watch.split()) < timeout:
		try:
			# Expect a free port, so use a small timeout
			Checker(timeout=0.1).assert_free(host, port)
			return
		except PortNotFree:
			# Politely wait.
			time.sleep(0.1)

	raise Timeout("Port {port} not free on {host}.".format(**locals()))
wait_for_free_port = free


def occupied(host, port, timeout=float('Inf')):
	"""
	Wait for the specified port to become occupied (accepting requests).
	Return when the port is occupied or raise a Timeout if timeout has
	elapsed.

	Timeout may be specified in seconds or as a timedelta.
	If timeout is None or ∞, the routine will run indefinitely.

	>>> occupied('localhost', find_available_local_port(), .1) # doctest: +IGNORE_EXCEPTION_DETAIL
	Traceback (most recent call last):
	    ...
	Timeout: Port ... not bound on localhost.
	"""
	if not host:
		raise ValueError("Host values of '' or None are not allowed.")

	if isinstance(timeout, datetime.timedelta):
		timeout = timeout.total_seconds()

	if timeout is None:
		# treat None as infinite timeout
		timeout = float('Inf')

	watch = timing.Stopwatch()

	while total_seconds(watch.split()) < timeout:
		try:
			Checker(timeout=.5).assert_free(host, port)
			# Politely wait
			time.sleep(0.1)
		except PortNotFree:
			# port is occupied
			return

	raise Timeout("Port {port} not bound on {host}.".format(**locals()))
wait_for_occupied_port = occupied


def find_available_local_port():
	"""
	Find a free port on localhost.

	>>> 0 < find_available_local_port() < 65536
	True
	"""
	sock = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
	addr = '', 0
	sock.bind(addr)
	addr, port = sock.getsockname()[:2]
	sock.close()
	return port


class HostPort(str):
	"""
	A simple representation of a host/port pair as a string

	>>> hp = HostPort('localhost:32768')

	>>> hp.host
	'localhost'

	>>> hp.port
	32768

	>>> len(hp)
	15
	"""

	@property
	def host(self):
		host, sep, port = self.partition(':')
		return host

	@property
	def port(self):
		host, sep, port = self.partition(':')
		return int(port)


def _main():
	parser = argparse.ArgumentParser()
	global_lookup = lambda key: globals()[key]
	parser.add_argument('target', metavar='host:port', type=HostPort)
	parser.add_argument('func', metavar='state', type=global_lookup)
	parser.add_argument('-t', '--timeout', default=None, type=float)
	args = parser.parse_args()
	try:
		args.func(args.target.host, args.target.port, timeout=args.timeout)
	except Timeout as timeout:
		print(timeout, file=sys.stderr)
		raise SystemExit(1)


# from jaraco.compat
def total_seconds(td):
	"""
	Python 2.7 adds a total_seconds method to timedelta objects.
	See http://docs.python.org/library/datetime.html#datetime.timedelta.total_seconds
	"""
	try:
		result = td.total_seconds()
	except AttributeError:
		result = (td.microseconds + (td.seconds + td.days * 24 * 3600) * 10**6) / 10**6
	return result


if __name__ == '__main__':
	_main()

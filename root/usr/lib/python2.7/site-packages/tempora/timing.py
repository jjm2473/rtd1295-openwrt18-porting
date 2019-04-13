# -*- coding: utf-8 -*-

from __future__ import unicode_literals, absolute_import

import datetime
import functools
import numbers

class Stopwatch(object):
	"""
	A simple stopwatch which starts automatically.

	>>> w = Stopwatch()
	>>> _1_sec = datetime.timedelta(seconds=1)
	>>> w.split() < _1_sec
	True
	>>> import time
	>>> time.sleep(1.0)
	>>> w.split() >= _1_sec
	True
	>>> w.stop() >= _1_sec
	True
	>>> w.reset()
	>>> w.start()
	>>> w.split() < _1_sec
	True

	It should be possible to launch the Stopwatch in a context:

	>>> with Stopwatch() as watch:
	...     assert isinstance(watch.split(), datetime.timedelta)

	In that case, the watch is stopped when the context is exited,
	so to read the elapsed time::

	>>> watch.elapsed # doctest: +ELLIPSIS
	datetime.timedelta(0, ...)
	"""
	def __init__(self):
		self.reset()
		self.start()

	def reset(self):
		self.elapsed = datetime.timedelta(0)
		if hasattr(self, 'start_time'):
			del self.start_time

	def start(self):
		self.start_time = datetime.datetime.utcnow()

	def stop(self):
		stop_time = datetime.datetime.utcnow()
		self.elapsed += stop_time - self.start_time
		del self.start_time
		return self.elapsed

	def split(self):
		local_duration = datetime.datetime.utcnow() - self.start_time
		return self.elapsed + local_duration

	# context manager support
	def __enter__(self):
		self.start()
		return self

	def __exit__(self, exc_type, exc_value, traceback):
		self.stop()


class IntervalGovernor(object):
	"""
	Decorate a function to only allow it to be called once per
	min_interval. Otherwise, it returns None.
	"""
	def __init__(self, min_interval):
		if isinstance(min_interval, numbers.Number):
			min_interval = datetime.timedelta(seconds=min_interval)
		self.min_interval = min_interval
		self.last_call = None

	def decorate(self, func):
		@functools.wraps(func)
		def wrapper(*args, **kwargs):
			allow = (
				not self.last_call
				or self.last_call.split() > self.min_interval
			)
			if allow:
				self.last_call = Stopwatch()
				return func(*args, **kwargs)
		return wrapper

	__call__ = decorate


class Timer(Stopwatch):
	"""
	Watch for a target elapsed time.

	>>> t = Timer(0.1)
	>>> t.expired()
	False
	>>> __import__('time').sleep(0.15)
	>>> t.expired()
	True
	"""
	def __init__(self, target=float('Inf')):
		self.target = self._accept(target)
		super(Timer, self).__init__()

	def _accept(self, target):
		"Accept None or ∞ or datetime or numeric for target"
		if isinstance(target, datetime.timedelta):
			target = target.total_seconds()

		if target is None:
			# treat None as infinite target
			target = float('Inf')

		return target

	def expired(self):
		return self.split().total_seconds() > self.target

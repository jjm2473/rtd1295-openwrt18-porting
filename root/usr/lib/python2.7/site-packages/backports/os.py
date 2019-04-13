"""
Partial backport of new functionality in Python 3.5's os module:

    fsencode (new in Python 3.2)
    fsdecode (new in Python 3.2)

Backport modifications are marked with "XXX backport" and "TODO backport".
"""
from __future__ import unicode_literals

import sys

# XXX backport: unicode on Python 2
_str = unicode if sys.version_info < (3,) else str

# XXX backport: Use backported surrogateescape for Python 2
# TODO backport: Find a way to do this without pulling in the entire future package?
if sys.version_info < (3,):
    from future.utils.surrogateescape import register_surrogateescape
    register_surrogateescape()


# XXX backport: This invalid_utf8_indexes() helper is shamelessly copied from
# Bob Ippolito's pyutf8 package (pyutf8/ref.py), in order to help support the
# Python 2 UTF-8 decoding hack in fsdecode() below.
#
# URL: https://github.com/etrepum/pyutf8/blob/master/pyutf8/ref.py
#
def _invalid_utf8_indexes(bytes):
    skips = []
    i = 0
    len_bytes = len(bytes)
    while i < len_bytes:
        c1 = bytes[i]
        if c1 < 0x80:
            # U+0000 - U+007F - 7 bits
            i += 1
            continue
        try:
            c2 = bytes[i + 1]
            if ((c1 & 0xE0 == 0xC0) and (c2 & 0xC0 == 0x80)):
                # U+0080 - U+07FF - 11 bits
                c = (((c1 & 0x1F) << 6) |
                     (c2 & 0x3F))
                if c < 0x80:
                    # Overlong encoding
                    skips.extend([i, i + 1])
                i += 2
                continue
            c3 = bytes[i + 2]
            if ((c1 & 0xF0 == 0xE0) and
                (c2 & 0xC0 == 0x80) and
                (c3 & 0xC0 == 0x80)):
                # U+0800 - U+FFFF - 16 bits
                c = (((((c1 & 0x0F) << 6) |
                       (c2 & 0x3F)) << 6) |
                     (c3 & 0x3f))
                if ((c < 0x800) or (0xD800 <= c <= 0xDFFF)):
                    # Overlong encoding or surrogate.
                    skips.extend([i, i + 1, i + 2])
                i += 3
                continue
            c4 = bytes[i + 3]
            if ((c1 & 0xF8 == 0xF0) and
                (c2 & 0xC0 == 0x80) and
                (c3 & 0xC0 == 0x80) and
                (c4 & 0xC0 == 0x80)):
                # U+10000 - U+10FFFF - 21 bits
                c = (((((((c1 & 0x0F) << 6) |
                         (c2 & 0x3F)) << 6) |
                       (c3 & 0x3F)) << 6) |
                     (c4 & 0x3F))
                if (c < 0x10000) or (c > 0x10FFFF):
                    # Overlong encoding or invalid code point.
                    skips.extend([i, i + 1, i + 2, i + 3])
                i += 4
                continue
        except IndexError:
            pass
        skips.append(i)
        i += 1
    return skips


# XXX backport: Another helper to support the Python 2 UTF-8 decoding hack.
def _chunks(b, indexes):
    i = 0
    for j in indexes:
        yield b[i:j]
        yield b[j:j + 1]
        i = j + 1
    yield b[i:]


def _fscodec():
    encoding = sys.getfilesystemencoding()
    if encoding == 'mbcs':
        errors = 'strict'
    else:
        errors = 'surrogateescape'

    # XXX backport: Do we need to hack around Python 2's UTF-8 codec?
    import codecs  # Use codecs.lookup() for name normalisation.
    _HACK_AROUND_PY2_UTF8 = (sys.version_info < (3,) and
                             codecs.lookup(encoding) == codecs.lookup('utf-8'))
    # Do we need to hack around Python 2's ASCII codec error handler behaviour?
    _HACK_AROUND_PY2_ASCII = (sys.version_info < (3,) and
                              codecs.lookup(encoding) == codecs.lookup('ascii'))

    # XXX backport: chr(octet) became bytes([octet])
    _byte = chr if sys.version_info < (3,) else lambda i: bytes([i])

    def fsencode(filename):
        """
        Encode filename to the filesystem encoding with 'surrogateescape' error
        handler, return bytes unchanged. On Windows, use 'strict' error handler if
        the file system encoding is 'mbcs' (which is the default encoding).
        """
        if isinstance(filename, bytes):
            return filename
        elif isinstance(filename, _str):
            if _HACK_AROUND_PY2_UTF8 or _HACK_AROUND_PY2_ASCII:
                # XXX backport: Unlike Python 3, Python 2's UTF-8 codec does not
                # consider surrogate codepoints invalid, so the surrogateescape
                # error handler never gets invoked to encode them back into high
                # bytes.
                #
                # This code hacks around that by manually encoding the surrogate
                # codepoints to high bytes, without relying on surrogateescape.
                #
                # As a *separate* issue to the above, Python2's ASCII codec has
                # a different problem: it correctly invokes the surrogateescape
                # error handler, but then seems to do additional strict
                # validation (?) on the interim surrogate-decoded Unicode buffer
                # returned by surrogateescape, and then fails with a
                # UnicodeEncodeError anyway.
                #
                # The fix for that happens to be the same (manual encoding),
                # even though the two causes are quite different.
                #
                return b''.join(
                    (_byte(ord(c) - 0xDC00) if 0xDC00 <= ord(c) <= 0xDCFF else
                     c.encode(encoding))
                    for c in filename)
            else:
                return filename.encode(encoding, errors)
        else:
            # XXX backport: unicode instead of str for Python 2
            raise TypeError("expect bytes or {_str}, not {}".format(type(filename).__name__,
                                                                    _str=_str.__name__, ))

    def fsdecode(filename):
        """
        Decode filename from the filesystem encoding with 'surrogateescape' error
        handler, return str unchanged. On Windows, use 'strict' error handler if
        the file system encoding is 'mbcs' (which is the default encoding).
        """
        if isinstance(filename, _str):
            return filename
        elif isinstance(filename, bytes):
            if _HACK_AROUND_PY2_UTF8:
                # XXX backport: See the remarks in fsencode() above.
                #
                # This case is slightly trickier: Python 2 will invoke the
                # surrogateescape error handler for most bad high byte
                # sequences, *except* for full UTF-8 sequences that happen to
                # decode to surrogate codepoints.
                #
                # For decoding, it's not trivial to sidestep the UTF-8 codec
                # only for surrogates like fsencode() does, but as a hack we can
                # split the input into separate chunks around each invalid byte,
                # decode the chunks separately, and join the results.
                #
                # This prevents Python 2's UTF-8 codec from seeing the encoded
                # surrogate sequences as valid, which lets surrogateescape take
                # over and escape the individual bytes.
                #
                # TODO: Improve this.
                #
                from array import array
                indexes = _invalid_utf8_indexes(array(str('B'), filename))
                return ''.join(chunk.decode(encoding, errors)
                               for chunk in _chunks(filename, indexes))
            else:
                return filename.decode(encoding, errors)
        else:
            # XXX backport: unicode instead of str for Python 2
            raise TypeError("expect bytes or {_str}, not {}".format(type(filename).__name__,
                                                                    _str=_str.__name__, ))

    return fsencode, fsdecode

fsencode, fsdecode = _fscodec()
del _fscodec

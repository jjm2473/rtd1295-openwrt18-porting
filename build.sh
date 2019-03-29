#!/bin/sh

rm -f root-squashfs.img
mksquashfs root root-squashfs.img -comp xz -all-root

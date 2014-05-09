#!/bin/sh
echo "reset" > /dev/ttySAC0 && avrdude -patmega328p -carduino -P/dev/ttySAC0 -b115200 -D -Uflash:w:$1:i 2>&1

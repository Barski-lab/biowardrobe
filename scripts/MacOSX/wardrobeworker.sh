#!/bin/bash

case "${1}" in
 "1")
/wardrobe/bin/DownloadRequests.py >>/tmp/download.log 2>&1 &
 ;;
 "2")
/wardrobe/bin/RunDNA.py >>/tmp/rundna.log 2>&1 &
 ;;
 "3")
/wardrobe/bin/RunRNA.py >>/tmp/runrna.log 2>&1 &
 ;;
esac

sleep 10s

wait

exit 0

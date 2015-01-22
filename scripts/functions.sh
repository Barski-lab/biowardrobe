#!/bin/bash

########## READ Config file
function get_db_credentials() {
re=0
USER=""
PASSWD=""
HOST=""

while read row; do 
if [ z"$row" == "z" ] || [[ "$row" == "#*" ]]; then 
continue
fi
case $re in
  1)
    USER=$row
    re=0
  ;;
  2)
    PASSWD=$row
    re=0
  ;;
  3)
    HOST=$row
    re=0
  ;;
*)
 M="Do nothing"
;;
esac
case $row in
 *User*)
  re=1
 ;;
 *password*)
  re=2
 ;;
 *host\ *)
  re=3
 ;;
 *)
    M="Do nothing" 
 ;;
esac
done </etc/wardrobe/wardrobe

export USER
export PASSWD
export HOST

}
########## READ Config file

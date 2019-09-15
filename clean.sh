#!/bin/bash

echo "Kill old nodes"
pkill -9 -e -f 'register server/index.ts'
pkill -9 -e -f 'register server/bootstrap.ts'
pkill -9 -e -f 'ts-node server/index.ts'
pkill -9 -e -f 'ts-node server/bootstrap.ts'
#!/bin/bash
shopt -s globstar
cp -RL --parents ./**/{fullchain,privkey}.pem $1

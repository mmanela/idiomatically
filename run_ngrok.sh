#!/bin/bash
echo "Starting ngrok..."

~/bin/ngrok start -config $HOME/.ngrok2/ngrok.yml -config ngrok.yml --all
#../ngrok/ngrok start -config $HOME/.ngrok2/ngrok.yml -config ngrok.yml server
#ngrok start -config $HOME/.ngrok2/ngrok.yml -config ngrok.yml server client
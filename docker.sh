#!/bin/bash
docker build -t code-editor .
docker run -d -p 3000:80 code-editor
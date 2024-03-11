#!/bin/bash


mongodump --port <PORT> -u <USER> -p <PASSWORD>  --host <HOST>  --archive=mongo-backup/fw-prod.archive

#!/bin/bash
docker-compose -f docker-compose-mrtgexchg.yaml up -d ca.Registry.com orderer.mrtgexchg.com peer0.Bank.com peer0.Insurance.com peer0.Registry.com peer0.Title.com peer0.Appraiser.com peer0.Audit.com peer0.Fico.com
docker-compose -f docker-compose-mrtgexchg.yaml up -d cli.Bank cli.Insurance cli.Registry cli.Title cli.Appraiser cli.Audit cli.Fico

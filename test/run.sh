#!/usr/bin/env bash

set -e

if [ -d "test/output" ]; then
  rm -rf test/output
fi

if [ ! -d "test/jspm_packages" ]; then
  jspm install
fi

babel test/fixtures/app --out-dir test/output/app --modules system

mocha --compilers js:babel/register test/**/*.spec.js

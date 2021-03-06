#######################################################
#   Docker container for OPNFV-TESTAPI
#######################################################
# Purpose: run opnfv-testapi for gathering test results
#
# Maintained by SerenaFeng
# Build:
#    $ docker build -t opnfv/testapi:tag .
#
# Execution:
#    $ docker run -dti -p 8001:8000 \
#      -e "base_url=http://10.63.243.17:8001" \
#      -e "mongodb_url=mongodb://10.63.243.17:27017/" \
#      opnfv/testapi:tag
#
# NOTE: providing swagger_url, mongodb_url is optional.
#       If not provided, it will use the default one
#       configured in config.ini
#
# All rights reserved. This program and the accompanying materials
# are made available under the terms of the Apache License, Version 2.0
# which accompanies this distribution, and is available at
# http://www.apache.org/licenses/LICENSE-2.0
#

FROM ubuntu:14.04
MAINTAINER SerenaFeng <feng.xiaowei@zte.com.cn>
LABEL version="v1" description="OPNFV TestAPI Docker container"

ENV HOME /home

# Packaged dependencies
RUN apt-get update && apt-get install -y \
curl \
git \
gcc \
wget \
python-dev \
python-pip \
crudini \
--no-install-recommends

RUN pip install --upgrade requests

RUN git config --global http.sslVerify false
RUN git clone https://gerrit.opnfv.org/gerrit/releng-testresults /home/releng-testresults

WORKDIR /home/releng-testresults/testapi
RUN pip install -r requirements.txt

# bugfix
# SSLError: hostname 'identity.linuxfoundation.org' doesn't match 'c.sni.fastly.net'
# hope it is a temprary, try to fix it in upstream python-cas lib
RUN sed -i '152,152s/)/,\ verify=False)/g' /usr/local/lib/python2.7/dist-packages/cas.py

RUN python setup.py install
CMD ["bash", "docker/start-server.sh"]

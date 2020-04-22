FROM soajsorg/node

RUN mkdir -p /opt/soajs/soajs.infra/node_modules/
WORKDIR /opt/soajs/soajs.infra/
COPY . .
RUN npm install

CMD ["/bin/bash"]
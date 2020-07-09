FROM zenika/alpine-chrome:with-puppeteer

EXPOSE 3000

# copy in our app
RUN mkdir /app
COPY . /app

USER chrome
ENTRYPOINT ["tini", "--"]

# Run your program under Tini
WORKDIR /app
CMD ["npm", "run", "start"]

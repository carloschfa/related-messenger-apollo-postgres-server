# Related Code Messenger Server for Postgres

Node.js server with Apollo GraphQL and Postgres.

Requirements:

  - Docker
  - Free port for server listening

# Installation

   With Docker installed, type this command in your terminal.
 
````
docker run -ti -d --privileged=true -p PORTNUMBER:3001 --name CONTAINERNAME carloschfa/related-code-messenger-server-postgres:1.0.0 "sbin/init"
````

Where PORTNUMBER is the free port for your server where your application will connect and CONTAINERNAME is the name of your  container, just for a better organization, we dont want to remove the wrong container in the future, right?

In my case the command will be this way: 
`
docker run -ti -d --privileged=true -p 3123:3001 --name messenger-server carloschfa/related-code-messenger-server-postgres:1.0.0 "sbin/init"
`

I'm mapping my Port number to be the 3123 and the container name to be messenger-server.
After you run the command, your output should be something like this:
`````
Unable to find image 'carloschfa/related-code-messenger-server-postgres:1.0.0' locally
1.0.0: Pulling from carloschfa/related-code-messenger-server-postgres
8a29a15cefae: Pull complete 
9b8c91efdfb3: Pull complete 
e99cc0f436ce: Pull complete 
Digest: sha256:fa56ec0195bf830920d6079be92f1f1de14c40f7ae1492b3197b46c7373c9ce8
Status: Downloaded newer image for carloschfa/related-code-messenger-server-postgres:1.0.0
a80a8014cbd1717c173467846ff033f01c66674c5f323c4440fa5ba39d47e201
`````

You can type in your browser the following URL to check if everything works as expected: localhost:PORTNUMBER in my case localhost:3123

### Installing in AWS Amazon EC2

Login in you AWS Console, choose an appropriate region for your server and follow the video instructions.

[AWS Video Tutorial]()


### Installing in DigitalOcean Droplet

Login in you DigitalOcean Account and follow the video instructions.

[DigitalOcean Video Tutorial]()

## Troubleshooting

If after you running the container you receive a ``Connection refused`` error when doing  any query in GraphQL, do the following commands:
````
docker stop CONTAINERNAME
service docker stop
service docker start
docker start CONTAINERNAME
````

And check if it works.

### Tech

This server uses a number of open source projects to work properly:

* [Node.js] - evented I/O for the backend
* [Apollo GraphQL](https://www.apollographql.com/) - GraphQL server.
* [PG](https://www.npmjs.com/package/pg) - Postgres connector.
* [Sequelize](https://sequelize.org/) - Database ORM.
* [ESM](https://www.npmjs.com/package/esm) - Babel-less module loader.


   [dill]: <https://github.com/joemccann/dillinger>
   [git-repo-url]: <https://github.com/joemccann/dillinger.git>
   [john gruber]: <http://daringfireball.net>
   [df1]: <http://daringfireball.net/projects/markdown/>
   [markdown-it]: <https://github.com/markdown-it/markdown-it>
   [Ace Editor]: <http://ace.ajax.org>
   [node.js]: <http://nodejs.org>
   [Twitter Bootstrap]: <http://twitter.github.com/bootstrap/>
   [jQuery]: <http://jquery.com>
   [@tjholowaychuk]: <http://twitter.com/tjholowaychuk>
   [express]: <http://expressjs.com>
   [AngularJS]: <http://angularjs.org>
   [Gulp]: <http://gulpjs.com>

   [PlDb]: <https://github.com/joemccann/dillinger/tree/master/plugins/dropbox/README.md>
   [PlGh]: <https://github.com/joemccann/dillinger/tree/master/plugins/github/README.md>
   [PlGd]: <https://github.com/joemccann/dillinger/tree/master/plugins/googledrive/README.md>
   [PlOd]: <https://github.com/joemccann/dillinger/tree/master/plugins/onedrive/README.md>
   [PlMe]: <https://github.com/joemccann/dillinger/tree/master/plugins/medium/README.md>
   [PlGa]: <https://github.com/RahulHP/dillinger/blob/master/plugins/googleanalytics/README.md>

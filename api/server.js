import server from '../dist/server/server.js';

export const config = {
  runtime: 'edge',
};

export default async function (request) {
  return server.fetch(request, process.env, {});
}

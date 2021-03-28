import { readTxtFile } from './utils'

const bfs = (rGraph, s, t, parent, V) => {
  const visited = new Array(V)
  for (let i = 0; i < V; ++i) {
    visited[i] = false
  }

  const queue = []
  queue.push(s)

  visited[s] = true
  parent[s] = -1

  while (queue.length !== 0) {
    let u = queue[0];
    queue.shift()

    for (let v = 0; v < V; v++) {
      if (visited[v] === false && rGraph[u][v] > 0) {
        if (v === t) {
          parent[v] = u
          return true
        }
        queue.push(v)
        parent[v] = u
        visited[v] = true
      }
    }
  }
  return false
}


const fordFulkerson = (graph, s, t, V) => {
  const rGraph = new Array(V).fill('').map(() => new Array(V))
  const parent = new Array(V)
  const path_flow_info = []

  let u, v, max_flow = 0

  for (u = 0; u < V; u++) {
    for (v = 0; v < V; v++) {
      rGraph[u][v] = graph[u][v]
    }
  }

  while (bfs(rGraph, s, t, parent, V)) {
    let path_flow = Number.MAX_VALUE;
    for (v = t; v !== s; v = parent[v]) {
      u = parent[v]
      path_flow = Math.min(path_flow, rGraph[u][v])
    }

    for (v = t; v !== s; v = parent[v]) {
      u = parent[v]
      rGraph[u][v] -= path_flow
      rGraph[v][u] += path_flow
    }

    max_flow += path_flow
    path_flow_info.push(path_flow)
  }

  return {
    max_flow,
    path_flow: path_flow_info,
  }
}

export async function solveFordFulkersonProblem(data) {
  const { matrix, length } = await readTxtFile(data)
  const {
    max_flow,
    path_flow,
  } = fordFulkerson(matrix, 0, length - 1, length)

  const output = path_flow.map(flow => `path_flow: ${flow}`).join('\n');

  return {
    output,
    _length: max_flow,
  }
}

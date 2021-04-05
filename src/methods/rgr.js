import { getVertices } from './utils'

const addEdge = (adj, v, w) => adj[v].push(w)

const topologicalSortUtil = (adj, v, visited, stack) => {
  visited[v] = true

  adj[v].forEach(vertex => {
    if (!visited[vertex])
      topologicalSortUtil(adj, vertex, visited, stack)
  })

  stack.push(v)
}

const topologicalSort = (adj, V) => {
  const stack = []

  const visited = new Array(V)
  for (let i = 0; i < V; i++) {
    visited[i] = false
  }

  for (let i = 0; i < V; i++) {
    if (visited[i] === false) {
      topologicalSortUtil(adj, i, visited, stack);
    }
  }

  return stack.reverse()
}

export async function topologicalSorting() {
  const length = 6
  const g = new Array(length).fill('').map(() => [])

  addEdge(g, 5, 2)
  addEdge(g, 5, 0)
  addEdge(g, 4, 0)
  addEdge(g, 4, 1)
  addEdge(g, 2, 3)
  addEdge(g, 3, 1)

  const result = topologicalSort(g, length)
  const output = `Matrix has vertices:
    F --> C
    F --> A
    E --> A
    E --> B
    C --> D
    D --> B
  `

  return {
    output,
    _length: '\n' + result.map(r => getVertices(length)[r]).join(' -> ')
  }
}

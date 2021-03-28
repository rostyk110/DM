import { readTxtFile, getVertices } from './utils'

const getMinEdgeWeight = (matrix, length, vertices) => {
  let minEdge = null

  for (let i = 0; i < length; i++) {
    if (vertices.includes(i)) {
      for (let j = 0; j < length; j++) {
        if (i !== j && !vertices.includes(j) && matrix[i][j]) {
          if (!minEdge) {
            minEdge = {
              vertex1: i,
              vertex2: j,
              weight: matrix[i][j],
            }
          } else {
            if (matrix[i][j] < minEdge.weight) {
              minEdge = {
                vertex1: i,
                vertex2: j,
                weight: matrix[i][j],
              }
            }
          }
        }
      }
    }
  }
  return minEdge
}


export async function methodPrime(data) {
  const { matrix, length } = await readTxtFile(data)
  const vertices = getVertices(length)

  const visited = {
    _length: 0,
    _vertices: [0],
  }
  while (Object.keys(visited).length <= length) {
    const edge = getMinEdgeWeight(matrix, length, visited._vertices)

    visited[vertices[edge.vertex1] + vertices[edge.vertex2]] = edge.weight
    visited._vertices = [...visited._vertices, edge.vertex2]
    visited._length += edge.weight
  }

  delete visited._vertices
  return visited
}

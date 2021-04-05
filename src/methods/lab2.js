import eulerianTrail from 'eulerian-trail'
import { find_path }  from 'dijkstrajs'
import {
  readTxtFile,
  getPossiblePairings,
  getVertices,
  matrixToGraph,
  getPathLength,
  getAllEdges,
  isBridge,
  edgeCount,
} from './utils'

const isEulerianGraph = (matrix, length) => {
  for (let i = 0; i < length; i++) {
    let vertices = 0
    for (let j = 0; j < length; j++) {
      if (matrix[i][j]) {
        if (Array.isArray(matrix[i][j])) {
          vertices += 2
        } else {
          vertices++
        }
      }
    }

    if (vertices % 2 !== 0) {
      return false
    }
  }
  return true
}

const getSumOfEdges = (matrix, length, addSum) => {
  let sum = 0
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (i < j) {
        if (addSum && Array.isArray(matrix[i][j])) {
          sum += matrix[i][j][0]
        } else {
          sum += matrix[i][j]
        }
      }
    }
  }
  return !addSum ? sum : (sum + addSum)
}

const getOddNodes = (matrix, length, isAddEdges) => {
  const nodes = []
  for (let i = 0; i < length; i++) {
    let edges = 0
    for (let j = 0; j < length; j++) {
      if (matrix[i][j]) {
        if (isAddEdges && Array.isArray(matrix[i][j])) {
          edges += 2
        } else {
          edges++
        }
      }
    }

    if (edges % 2 !== 0) {
      nodes.push(i)
    }
  }
  return nodes
}

const getShortestPath = (matrix, length, pairs) => {
  const graph = matrixToGraph(matrix)
  const getPathLen = path => getPathLength(matrix, length, path)
  const findPath = point => find_path(graph, point[0].toString(), point[1].toString())

  return pairs.reduce((acc, pair) => {
    const [ first, second ] = pair
    const [ path1, path2 ] = [findPath(first), findPath(second)]
    const [ length1, length2 ] = [getPathLen(path1), getPathLen(path2)]
    const totalLength = length1 + length2

    if (!Object.keys(acc).length) {
      Object.assign(
        acc,
        { pair, path1, path2, length1, length2, totalLength }
        )
    } else {
      if (acc.totalLength > totalLength) {
        Object.assign(
          acc,
          { pair, path1, path2, length1, length2, totalLength }
        )
      }
    }

    return acc
  }, {})
}

const modifyMatrix = (matrix, pathInfo) => {
  pathInfo.pair.forEach((p, index) => {
    if (matrix[p[0]][p[1]]) {
      matrix[p[0]][p[1]] = [matrix[p[0]][p[1]], pathInfo[`length${index + 1}`]]
      matrix[p[1]][p[0]] = [matrix[p[1]][p[0]], pathInfo[`length${index + 1}`]]
    } else {
      matrix[p[0]][p[1]] = pathInfo[`length${index + 1}`]
      matrix[p[1]][p[0]] = pathInfo[`length${index + 1}`]
    }
  })

  return matrix
}

const getEulerianPath = (graph, length, start, result) => {
  let edge = edgeCount(graph, length)

  for (let v = 0; v < length; v++) {
    if(graph[start][v]) {
      if (edge <= 1 || !isBridge(graph, length, start, v)) {
        result.push(v)
        graph[start][v] = graph[v][start] = 0
        edge--
        getEulerianPath(graph, length, v, result)
      }
    }
  }
  return result
}


export async function solvePostmanProblem(data) {
  const { matrix, length } = await readTxtFile(data)

  if (isEulerianGraph(matrix, length)) {
    console.log(getSumOfEdges(matrix, length, true))
  } else {
    const oddNodes = getOddNodes(matrix, length)
    const pairs = getPossiblePairings(oddNodes)
    const shortestPath = getShortestPath(matrix, length, pairs)
    const modifiedMatrix = modifyMatrix(matrix, shortestPath)

    if (isEulerianGraph(modifiedMatrix, length)) {
      const { totalLength } = shortestPath
      const optimalRouteLength = getSumOfEdges(modifiedMatrix, length, totalLength)

      const eulerianPath = eulerianTrail({
        edges: getAllEdges(modifiedMatrix),
      })

      const output = 'Chinese Postman Route: \n' +
        eulerianPath.map(i => getVertices(length)[i]).join(' --> ')

      return {
        output,
        _length: optimalRouteLength,
      }
    } else {
      console.log('Ohhhhhhhhhhhhhhhhhhhhhhhh')
    }
  }
}

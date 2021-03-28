export const readTxtFile = async file => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      const string = reader.result
      const rows = string.split('\n')

      resolve({
        matrix: rows.slice(1).map(row => {
          const cols = row.split(' ');
          return cols.map(col => +col)
        }),
        length: +rows[0],
      })
    };

    reader.readAsText(file);
  })
}

export const getVertices = num => new Array(+num)
  .fill('')
  .map((_, i) => String.fromCharCode(65 + i))

export const getPossiblePairings = data => {
  const pairs = []

  for (let i = 1; i < data.length; i++) {
    const pair1 = [data[0], data[i]]
    const pair2 = data.filter(vertix => !pair1.includes(vertix))

    pairs.push([pair1, pair2])
  }

  return pairs
}

export const matrixToGraph = matrix => {
  return matrix.reduce((acc, row, i) => {
    acc[i] = row.reduce((acc, col, j) => {
      if (col) {
        acc[j] = col
      }
      return acc
    }, {})

    return acc
  }, {})
}

export const getPathLength = (matrix, length, path) => {
  const myPath = [...path]
  let pathLength = 0

  do {
    pathLength += matrix[+myPath[0]][+myPath[1]]
    myPath.shift()
  } while(myPath.length >= 2)

  return pathLength
}

export const getIncidenceMatrix = matrix => {
  return matrix.map(row => row.map(col => col ? 1 : 0))
}

export const isBridge = (graph, length, u, v) => {
  let deg = 0;
  for (let i = 0; i < length; i++) {
    if (graph[v][i])
      deg++
    if (deg > 1) {
      return false
    }
  }

  return true
}

export const edgeCount = (graph, length) => {
  let count = 0;
  for (let i = 0; i < length; i++) {
    for (let j = i; j < length; j++) {
      if (graph[i][j]) {
        count++
      }
    }
  }
  return count
}

export const getAllEdges = graph => {
  const result = []
  for (let i = 0; i < graph.length; i++) {
    for (let j = 0; j < graph[0].length; j++) {
      if (graph[i][j] && i > j) {
        if (Array.isArray(graph[i][j])) {
          result.push([i, j])
        }
        result.push([j, i])
      }
    }
  }
  return result
}

import { getVertices, readTxtFile } from './utils'

let final_res = Number.MAX_VALUE

const copyToFinal = (curr_path, final_path, N) => {
  for (let i = 0; i < N; i++) {
    final_path[i] = curr_path[i]
  }

  final_path[N] = curr_path[0]
}

const firstMin = (adj, i, N) => {
  let min = Number.MAX_VALUE
  for (let k = 0; k < N; k++) {
    if (adj[i][k] < min && i !== k)
      min = adj[i][k]
  }
  return min
}

const secondMin = (adj, i, N) => {
  let first = Number.MAX_VALUE
  let second = Number.MAX_VALUE

  for (let j = 0; j < N; j++) {
    if (i === j) continue

    if (adj[i][j] <= first) {
      second = first
      first = adj[i][j]
    } else if (adj[i][j] <= second && adj[i][j] !== first) {
      second = adj[i][j]
    }
  }
  return second
}

const TSPRec = (adj, curr_bound, curr_weight, level, curr_path, final_path, visited, N) => {
  if (level === N) {
    if (adj[curr_path[level-1]][curr_path[0]] !== 0) {
      const curr_res = curr_weight + adj[curr_path[level-1]][curr_path[0]]
      if (curr_res < final_res) {
        copyToFinal(curr_path, final_path, N)
        final_res = curr_res
      }
    }
    return
  }

  for (let i = 0; i < N; i++) {
    if (adj[curr_path[level-1]][i] !== 0 && visited[i] === false) {
      let temp = curr_bound
      curr_weight += adj[curr_path[level-1]][i]

      if (level === 1) {
        curr_bound -= ((firstMin(adj, curr_path[level-1], N) + firstMin(adj, i, N))/2)
      } else {
        curr_bound -= ((secondMin(adj, curr_path[level-1], N) + firstMin(adj, i, N))/2)
      }

      if (curr_bound + curr_weight < final_res) {
        curr_path[level] = i
        visited[i] = true
        TSPRec(adj, curr_bound, curr_weight, level+1, curr_path, final_path, visited, N)
      }


      curr_weight -= adj[curr_path[level-1]][i]
      curr_bound = temp

      visited.fill(false)

      for (let j=0; j <= level-1; j++) {
        visited[curr_path[j]] = true
      }
    }
  }
}


const TSP = (adj, visited, final_path, N) => {
  let curr_path = new Array(N + 1)
  let curr_bound = 0

  curr_path.fill(-1)
  visited.fill(false)

  for (let i = 0; i < N; i++) {
    curr_bound += firstMin(adj, i, N) + secondMin(adj, i, N)
  }

  curr_bound = curr_bound === 1 ? curr_bound / 2 + 1 : curr_bound / 2

  visited[0] = true
  curr_path[0] = 0

  TSPRec(adj, curr_bound, 0, 1, curr_path, final_path, visited, N)
}

export async function solveTravellingSalesmanProblem(data) {
  const { matrix, length } = await readTxtFile(data)

  const final_path = new Array(length + 1)
  let visited = new Array(length)
  final_res = Number.MAX_VALUE

  TSP(matrix, visited, final_path, length)

  const output = 'Travelling Salesman Route: \n' +
    final_path.map(i => getVertices(length)[i]).join(' --> ')

  return {
    output,
    _length: final_res,
  }
}

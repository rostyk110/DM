import { readTxtFile } from './utils'

export async function solveFordFulkersonProblem(data) {
  const { matrix, length } = await readTxtFile(data)

  console.log('%c Ford - Fulkerson Algorithm', 'color: red')

  console.log('matrix \n', matrix)
  console.log('length: ', length)
}

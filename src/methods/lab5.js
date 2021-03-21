import { readTxtFile } from './utils'

export async function solveIsomorphismProblem(data) {
  const { matrix, length } = await readTxtFile(data)

  console.log('%c Isomorphism', 'color: red')

  console.log('matrix \n', matrix)
  console.log('length: ', length)
}

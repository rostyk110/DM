import { readTxtFile } from './utils'

const replaceDiagolanValuesWithM = matrix => matrix.map((row, i) => row.map((col, j) => i === j ? 'M' : col))

const getMinValues = (matrix, length, byRows = true, notNull = false) => {
  let result = []
  const zerosAmount = byRows
    ? matrix.reduce((acc, row) => {
      acc.push(row.reduce((acc, col) => acc + Number(!col), 0))
      return acc
    }, [])
    : matrix.reduce((acc, row, i) => {
      acc.push(row.reduce((acc, col, j) => acc + Number(!matrix[j][i]), 0))
      return acc
    }, [])

  for (let i = 0; i < length; i++) {
    let min = undefined

    for (let j = 0; j < length; j++) {
      if (byRows && matrix[i][j] !== 'M' || !byRows && matrix[j][i] !== 'M') {
        if (byRows && (min === undefined || matrix[i][j] < min)) {
          min = !notNull
            ? matrix[i][j]
            : (zerosAmount[i] > 1 || matrix[i][j] !== 0)
              ? matrix[i][j]
              : min
        } else if (!byRows && (min === undefined || matrix[j][i] < min)) {
          min = !notNull
            ? matrix[j][i]
            : (zerosAmount[i] > 1 || matrix[j][i] !== 0)
              ? matrix[j][i]
              : min
        }
      }
    }
    result.push(min)
  }

  return result
}

const subtractMatrix = (matrix, length, values, byRows = true) => {
  const subtractedMatrix = JSON.parse(JSON.stringify(matrix))

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (i !== j) {
        if (byRows) {
          subtractedMatrix[i][j] -= values[i]
        } else if (!byRows) {
          subtractedMatrix[j][i] -= values[i]
        }
      }
    }
  }

  return subtractedMatrix
}

const getReducedMatrix = (matrix, length) => {
  const minValuesByRows = getMinValues(matrix, length)
  const subtractedMatrixByRows = subtractMatrix(matrix, length, minValuesByRows)
  const minValuesByCols = getMinValues(subtractedMatrixByRows, length, false)
  const subtractedMatrixByCols = subtractMatrix(subtractedMatrixByRows, length, minValuesByCols, false)

  return {
    newMatrix: subtractedMatrixByCols,
    lowerBound: minValuesByRows
      .concat(minValuesByCols)
      .reduce((acc, el) => acc + +el, 0)
  }
}

const replaceZerosWithConstants = (matrix, constantsByRows, constantsByCols) => {
  let maxConst = null

  matrix.forEach((row, i) => row.forEach((col, j) => {
    if (i !== j && col === 0) {
      const sumConst = constantsByRows[i] + constantsByCols[j]

      if (!maxConst || maxConst.value < sumConst || constantsByRows[i] === 0 && maxConst.value === sumConst ) {
        maxConst = { value: sumConst, i, j }
      }
    }
  }))
  return maxConst
}

const deleteRow = (matrix, index) => {
  matrix.splice(index, 1);
  return matrix;
}

const deleteCol = (matrix, index) => {
  for (let i = 0; i < matrix.length; i++) {
    matrix[i].splice(index, 1);
  }
  return matrix;
}

const subtractValueToRowCol = (matrix, length, lowerBoundSubset) => {
  const newMatrix = JSON.parse(JSON.stringify(matrix))
  const { type = 'row', index, value } = lowerBoundSubset

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (type === 'row' && i === index && newMatrix[i][j] !== 'M') {
        newMatrix[i][j] -= value
      } else if (type === 'col' && i === index && newMatrix[j][i] !== 'M') {
        newMatrix[j][i] -= value
      }
    }
  }

  return newMatrix
}

const getReversedOffsetIndex = (maxConst, path, dontPush) => {
  const { i, j } = maxConst

  const amountOfRowsWithBiggerIndex = path.reduce((acc, p) => {
    if (i >= p.i) {
      acc++
    }
    return acc
  }, 0)

  const amountOfColsWithBiggerIndex = path.reduce((acc, p) => {
    if (j >= p.j) {
      acc++
    }
    return acc
  }, 0)

  const reversedOffsetRowIndex = amountOfColsWithBiggerIndex ? j + amountOfColsWithBiggerIndex : j
  const reversedOffsetColIndex = amountOfRowsWithBiggerIndex ? i + amountOfRowsWithBiggerIndex : i

  const amountOfRowsWithBiggerIndexReverse = path.reduce((acc, p) => {
    if (reversedOffsetRowIndex >= p.i) {
      acc++
    }
    return acc
  }, 0)

  const amountOfColsWithBiggerIndexReverse = path.reduce((acc, p) => {
    if (reversedOffsetColIndex >= p.j) {
      acc++
    }
    return acc
  }, 0)

  dontPush && path.push({ i: reversedOffsetColIndex, j: reversedOffsetRowIndex })

  return {
    i: amountOfRowsWithBiggerIndexReverse ? reversedOffsetRowIndex - amountOfRowsWithBiggerIndexReverse : reversedOffsetRowIndex,
    j: amountOfColsWithBiggerIndexReverse ? reversedOffsetColIndex - amountOfColsWithBiggerIndexReverse : reversedOffsetColIndex
  }
}

const addMissingRibs = path => {
  const fixedLength = path.length

  for (let i = 0; i < fixedLength; i++) {
    if (i < path.length - 2 && path[i].j !== path[i + 1].i) {
      path.splice(i + 1, 0, {
        i: path[i].j,
        j: path[i + 1].i,
      })
      i++
    } else if (i === path.length - 2 && path[i].j !== path[0].i) {
      path.push({
        i: path[i].j,
        j: path[0].i,
      })
    }
  }

  return path
}

const startAlgorithm = (matrix, length, lowerBound, path, print) => {
  if (matrix.length === 2) {
    path.pathLength = lowerBound
    return
  }

  matrix = JSON.parse(JSON.stringify(matrix))

  print && console.log(matrix)

  const constantsByRows = getMinValues(matrix, length, true, true)
  const constantsByCols = getMinValues(matrix, length, false, true)

  const maxConst = replaceZerosWithConstants(matrix, constantsByRows, constantsByCols)
  const lowerBoundNormal = lowerBound + maxConst.value

  // offset index for constant reverse
  if (path.length) {
    const offsetIndex = getReversedOffsetIndex(maxConst, path, matrix.length > 2)
    if (matrix.length > 2) {
      const isRowDeleted = path.find(p => p.i === offsetIndex.i)
      const isColDeleted = path.find(p => p.j === offsetIndex.j)

      if (!isRowDeleted && !isColDeleted) {
        matrix[offsetIndex.i][offsetIndex.j] = 'M'
      }
    }
  } else {
    matrix[maxConst.j][maxConst.i] = 'M'
    path.push({ i: maxConst.i, j: maxConst.j })
  }

  const reducedMatrix = deleteRow(
    deleteCol(JSON.parse(JSON.stringify(matrix)), maxConst.j),
    maxConst.i
  )

  const minValuesByRows = getMinValues(reducedMatrix, reducedMatrix.length, true, false)
  const minValuesByCols = getMinValues(reducedMatrix, reducedMatrix.length, false, false)

  const lowerBoundSubset = minValuesByRows
    .concat(minValuesByCols)
    .reduce((acc, el, i) => {
      acc.value += el
      if (el) {
        const isRow = i + 1 <= reducedMatrix.length
        acc.index = isRow ? i : i -  reducedMatrix.length
        acc.type = isRow ? 'row' : 'col'
      }
      return acc
    }, { value: 0 })


  if (reducedMatrix.length === 2) {
    const tempResult = {
      matrix: reducedMatrix,
      length: reducedMatrix.length,
      lowerBound: lowerBoundSubset.value <= lowerBoundNormal ? lowerBoundSubset.value : lowerBoundNormal,
    }

    return tempResult;
    // startAlgorithm(tempResult.matrix, tempResult.length, tempResult.lowerBound, path)
  }

  const newMatrix = subtractValueToRowCol(reducedMatrix, reducedMatrix.length, lowerBoundSubset)

  lowerBoundSubset.value += lowerBound

  const tempResult = {
    matrix: newMatrix,
    length: newMatrix.length,
    lowerBound: lowerBoundSubset.value <= lowerBoundNormal ? lowerBoundSubset.value : lowerBoundNormal,
  }

  return tempResult
  // startAlgorithm(tempResult.matrix, tempResult.length, tempResult.lowerBound, path)
}

export async function solveTravellingSalesmanProblem(data) {
  const { matrix, length } = await readTxtFile(data)
  const { newMatrix, lowerBound } = getReducedMatrix(replaceDiagolanValuesWithM(matrix), length)
  const path = []

  const a1 = startAlgorithm(newMatrix, length, lowerBound, path, true)
  const a2 = startAlgorithm(a1.matrix, a1.length, a1.lowerBound, path)
  const a3 = startAlgorithm(a2.matrix, a2.length, a2.lowerBound, path)
  const a4 = startAlgorithm(a3.matrix, a3.length, a3.lowerBound, path)
  const a5 = startAlgorithm(a4.matrix, a4.length, a4.lowerBound, path)
  // const result = addMissingRibs(path)
}



















import { readTxtFile } from './utils'

const replaceDiagolanValuesWithM = matrix => matrix.map((row, i) => row.map((col, j) => i === j ? 'M' : col))

const getMinValues = (matrix, length, byRows = true, notNull = false) => {
  let result = []
  const zerosAmount = byRows
    ? matrix.reduce((acc, row) => {
      acc.push(row.reduce((acc, col) => acc + Number(!col), 0))
      return acc
    }, [])
    : matrix.reduce((acc, row, i) => {
      acc.push(row.reduce((acc, col, j) => acc + Number(!matrix[j][i]), 0))
      return acc
    }, [])

  for (let i = 0; i < length; i++) {
    let min = undefined

    for (let j = 0; j < length; j++) {
      if (byRows && matrix[i][j] !== 'M' || !byRows && matrix[j][i] !== 'M') {
        if (byRows && (min === undefined || matrix[i][j] < min)) {
          min = !notNull
            ? matrix[i][j]
            : (zerosAmount[i] > 1 || matrix[i][j] !== 0)
              ? matrix[i][j]
              : min
        } else if (!byRows && (min === undefined || matrix[j][i] < min)) {
          min = !notNull
            ? matrix[j][i]
            : (zerosAmount[i] > 1 || matrix[j][i] !== 0)
              ? matrix[j][i]
              : min
        }
      }
    }
    result.push(min)
  }

  return result
}

const subtractMatrix = (matrix, length, values, byRows = true) => {
  const subtractedMatrix = JSON.parse(JSON.stringify(matrix))

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (i !== j) {
        if (byRows) {
          subtractedMatrix[i][j] -= values[i]
        } else if (!byRows) {
          subtractedMatrix[j][i] -= values[i]
        }
      }
    }
  }

  return subtractedMatrix
}

const getReducedMatrix = (matrix, length) => {
  const minValuesByRows = getMinValues(matrix, length)
  const subtractedMatrixByRows = subtractMatrix(matrix, length, minValuesByRows)
  const minValuesByCols = getMinValues(subtractedMatrixByRows, length, false)
  const subtractedMatrixByCols = subtractMatrix(subtractedMatrixByRows, length, minValuesByCols, false)

  return {
    newMatrix: subtractedMatrixByCols,
    lowerBound: minValuesByRows
      .concat(minValuesByCols)
      .reduce((acc, el) => acc + +el, 0)
  }
}

const replaceZerosWithConstants = (matrix, constantsByRows, constantsByCols) => {
  let maxConst = null

  matrix.forEach((row, i) => row.forEach((col, j) => {
    if (i !== j && col === 0) {
      const sumConst = constantsByRows[i] + constantsByCols[j]

      if (!maxConst || maxConst.value < sumConst) { // || constantsByRows[i] === 0 && maxConst.value === sumConst
        maxConst = { value: sumConst, i, j }
      }
    }
  }))
  return maxConst
}

const deleteRow = (matrix, index) => {
  matrix.splice(index, 1);
  return matrix;
}

const deleteCol = (matrix, index) => {
  for (let i = 0; i < matrix.length; i++) {
    matrix[i].splice(index, 1);
  }
  return matrix;
}

const subtractValueToRowCol = (matrix, length, lowerBoundSubset) => {
  const newMatrix = JSON.parse(JSON.stringify(matrix))
  const { type = 'row', index, value } = lowerBoundSubset

  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      if (type === 'row' && i === index && newMatrix[i][j] !== 'M') {
        newMatrix[i][j] -= value
      } else if (type === 'col' && i === index && newMatrix[j][i] !== 'M') {
        newMatrix[j][i] -= value
      }
    }
  }

  return newMatrix
}

const getReversedOffsetIndex = (maxConst, path, dontPush, print) => {
  const { i, j } = maxConst

  const amountOfRowsWithBiggerIndex = path.reduce((acc, p, pathIndex) => {
    print && console.log(i, p.i)

    pathIndex = pathIndex
      ? pathIndex + path.slice(0, pathIndex).length
      // .reduce(
      //     (acc, item, index) => acc + (pathIndex >= index ? 1 : 0),
      //     0
      //   )
      : pathIndex


    if (i + pathIndex >= p.i) {
      acc++
    }
    return acc
  }, 0)

  const amountOfColsWithBiggerIndex = path.reduce((acc, p) => {
    if (j >= p.j) {
      acc++
    }
    return acc
  }, 0)

  const reversedOffsetRowIndex = amountOfColsWithBiggerIndex ? j + amountOfColsWithBiggerIndex : j
  const reversedOffsetColIndex = amountOfRowsWithBiggerIndex ? i + amountOfRowsWithBiggerIndex : i

  print && console.log(amountOfRowsWithBiggerIndex)

  const amountOfRowsWithBiggerIndexReverse = path.reduce((acc, p) => {
    if (reversedOffsetRowIndex >= p.i) {
      acc++
    }
    return acc
  }, 0)

  const amountOfColsWithBiggerIndexReverse = path.reduce((acc, p) => {
    if (reversedOffsetColIndex >= p.j) {
      acc++
    }
    return acc
  }, 0)

  dontPush && path.push({ i: reversedOffsetColIndex, j: reversedOffsetRowIndex })

  return {
    i: amountOfRowsWithBiggerIndexReverse ? reversedOffsetRowIndex - amountOfRowsWithBiggerIndexReverse : reversedOffsetRowIndex,
    j: amountOfColsWithBiggerIndexReverse ? reversedOffsetColIndex - amountOfColsWithBiggerIndexReverse : reversedOffsetColIndex
  }
}

const addMissingRibs = path => {
  const fixedLength = path.length

  for (let i = 0; i < fixedLength; i++) {
    if (i < path.length - 2 && path[i].j !== path[i + 1].i) {
      path.splice(i + 1, 0, {
        i: path[i].j,
        j: path[i + 1].i,
      })
      i++
    } else if (i === path.length - 2 && path[i].j !== path[0].i) {
      path.push({
        i: path[i].j,
        j: path[0].i,
      })
    }
  }

  return path
}

const startAlgorithm = (matrix, length, lowerBound, path, print) => {
  if (matrix.length === 2) {
    path.pathLength = lowerBound
    return
  }

  matrix = JSON.parse(JSON.stringify(matrix))

  // print && console.log(matrix)

  const constantsByRows = getMinValues(matrix, length, true, true)
  const constantsByCols = getMinValues(matrix, length, false, true)

  const maxConst = replaceZerosWithConstants(matrix, constantsByRows, constantsByCols)
  const lowerBoundNormal = lowerBound + maxConst.value

  // print && console.log(constantsByRows)
  // print && console.log(constantsByCols)
  // print && console.log(maxConst)
  // print && console.log(lowerBoundNormal)



  const tempMatrix = JSON.parse(JSON.stringify(matrix))
  // print && console.log(tempMatrix)
  // offset index for constant reverse
  if (path.length) {
    const offsetIndex = getReversedOffsetIndex(maxConst, path, tempMatrix.length > 2, print)

    if (tempMatrix.length > 2) {
      const isRowDeleted = path.find(p => p.i === offsetIndex.i)
      const isColDeleted = path.find(p => p.j === offsetIndex.j)

      if (!isRowDeleted && !isColDeleted) {
        // tempMatrix[offsetIndex.i][offsetIndex.j] = 'M'
      } else {
        // print && console.log(offsetIndex)
        // print && console.log(JSON.parse(JSON.stringify(tempMatrix)))
        tempMatrix[offsetIndex.i][offsetIndex.j] = 'M'
        print && console.log(JSON.parse(JSON.stringify(tempMatrix)))
      }
    }
  } else {
    tempMatrix[maxConst.j][maxConst.i] = 'M'
    path.push({ i: maxConst.i, j: maxConst.j })
  }

  // print && console.log(tempMatrix)
  // print && console.log(path)

  // print && console.log(JSON.parse(JSON.stringify(tempMatrix)))
  // print && console.log(maxConst)

  const reducedMatrix = deleteRow(
    deleteCol(tempMatrix, maxConst.j),
    maxConst.i
  )

  // print && console.log(JSON.parse(JSON.stringify(reducedMatrix)))

  const minValuesByRows = getMinValues(reducedMatrix, reducedMatrix.length, true, false)
  const minValuesByCols = getMinValues(reducedMatrix, reducedMatrix.length, false, false)

  const lowerBoundSubset = minValuesByRows
    .concat(minValuesByCols)
    .reduce((acc, el, i) => {
      acc.value += el
      if (el) {
        const isRow = i + 1 <= reducedMatrix.length
        acc.index = isRow ? i : i -  reducedMatrix.length
        acc.type = isRow ? 'row' : 'col'
      }
      return acc
    }, { value: 0 })


  if (reducedMatrix.length === 2) {
    const tempResult = {
      matrix: reducedMatrix,
      length: reducedMatrix.length,
      lowerBound: lowerBoundSubset.value <= lowerBoundNormal ? lowerBoundSubset.value : lowerBoundNormal,
    }

    return tempResult;
    // startAlgorithm(tempResult.matrix, tempResult.length, tempResult.lowerBound, path)
  }

  const newMatrix = subtractValueToRowCol(reducedMatrix, reducedMatrix.length, lowerBoundSubset)

  lowerBoundSubset.value += lowerBound

  const tempResult = {
    matrix: newMatrix,
    length: newMatrix.length,
    lowerBound: lowerBoundSubset.value <= lowerBoundNormal ? lowerBoundSubset.value : lowerBoundNormal,
  }

  // print && console.log(tempResult)

  return tempResult
  // startAlgorithm(tempResult.matrix, tempResult.length, tempResult.lowerBound, path)
}

export async function solveTravellingSalesmanProblem(data) {
  const { matrix, length } = await readTxtFile(data)
  const { newMatrix, lowerBound } = getReducedMatrix(replaceDiagolanValuesWithM(matrix), length)
  const path = []

  const a1 = startAlgorithm(newMatrix, length, lowerBound, path)
  const a2 = startAlgorithm(a1.matrix, a1.length, a1.lowerBound, path)
  const a3 = startAlgorithm(a2.matrix, a2.length, a2.lowerBound, path, true)
  // const a4 = startAlgorithm(a3.matrix, a3.length, a3.lowerBound, path, true)
  // const a5 = startAlgorithm(a4.matrix, a4.length, a4.lowerBound, path)
  // const result = addMissingRibs(path)
  // console.log(a4)
  console.log(path)
}

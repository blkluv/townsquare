const glob = require('glob')
const {resolve, sep} = require('node:path')
const {existsSync} = require('node:fs')
const {mkdir, copyFile} = require('node:fs/promises')

async function getGlob(path) {
  try {
    console.log(path)
    return await glob.glob(path)
  } catch (err) {
    console.log(err)
  }
}

function getDirPath(filePath) {
  return filePath.split(sep).slice(0, -1).join(sep)
}

async function getSrcFilePaths(fromRepoName, toRepoName) {
  const fileGlob = resolve(__dirname, `../../${fromRepoName}/src/**/*.*`)
  const originalPaths = await getGlob(fileGlob)
  const sub = `/${fromRepoName}/src/`
  const oldPathPrefix = fileGlob.slice(0, fileGlob.indexOf(sub) + sub.length)
  const newPathPrefix = oldPathPrefix.replace(sub, `/${toRepoName}/src/`)
  const newPaths = originalPaths.map(originalPath => {
    return originalPath.replace(oldPathPrefix, newPathPrefix)
  })
  return {
    originalPaths,
    newPaths,
  }
}

async function copySingle(fromPath, toPath) {
  // TODO(Partyman): use fsPromises.cp(src, dest[, options]) for options 'recursive' when
  // it is no longer experimental
  const dirPath = getDirPath(toPath)
  if (!existsSync(dirPath)) {
    await mkdir(dirPath)
  }

  return await copyFile(fromPath, toPath, 2)
}

async function copyAll() {
  const {originalPaths, newPaths} = await getSrcFilePaths(
    'social-app',
    'townsquare',
  )
  const promises = []
  for (let i = 0; i < originalPaths.length; i++) {
    promises.push(copySingle(originalPaths[i], newPaths[i]))
  }
  return await Promise.all(promises)
}

async function main() {
  await copyAll()
}

main()
  .then(() => console.log('finished'))
  .catch(err => console.log(err))
  .finally(() => process.exit())

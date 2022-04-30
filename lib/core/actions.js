const { promisify } = require('util')
const path = require('path')

const download = promisify(require('download-git-repo'))
const open = require('open')

const { vueRepo } = require('../config/repo-config')
const { commandSpawn } = require('../utils/terminal')
const { compile, writeToFile, createDirSync } = require('../utils/utils')

// 创建项目的action回调函数
// callback -> promisify(函数) -> Promise -> async await
const createProjectAction = async (project) => {
  console.log('czj helps you create your project~');
  
  try {
    // 1. clone项目
    await download(vueRepo, project, { clone: true })
    // 2. 执行npm install
    // 注意：window系统下须执行 npm.cmd 命令
    const command = process.platform === 'win32' ? 'npm.cmd' : npm
    await commandSpawn(command, ['install'], {cwd: `./${project}`})

    // 3. 运行npm run serve
    commandSpawn(command, ['run', 'serve'], {cwd: `./${project}`})

    // 4. 打开浏览器
    open('http://localhost:8080/')
  } catch (err) {
    console.log(err);
  }
}

// 添加组件的action
const addComponentAction = async (name, dest) => {
  // 1.有对应的ejs模板
  // 2.编译ejs模板 result
  const result = await compile("vue-component.ejs", { name, lowerName: name.toLowerCase() })
  
  // 3.将result写入到.vue文件中
  // 4.放到对应的文件夹中
  const targetPath = path.resolve(dest, `${name}.vue`)
  writeToFile(targetPath, result)
}

// 添加组件和路由
const addPageAndRouteAction = async (name, dest) => {
  // 1.有对应的ejs模板
  // 2.编译ejs模板
  const data = { name, lowerName: name.toLowerCase() }
  const pageResult = await compile("vue-component.ejs", data)
  const routeResult = await compile("vue-component.ejs", data)

  // 3.将result写入到.vue文件中
  // 4.放到对应的文件夹中
  const targetDest = path.resolve(dest, name.toLowerCase())
  if (createDirSync(targetDest)) {
    const targetPagePath = path.resolve(targetDest, `${name}.vue`)
    const targetRouterPath = path.resolve(targetDest, 'router.js')
    writeToFile(targetPagePath, pageResult)
    writeToFile(targetRouterPath, routeResult)
  }
}

// 添加store
const addStoreAction = async (name, dest) => {
  // 1.有对应的ejs模板
  // 2.编译ejs模板
  const storeResult = await compile("vue-store.ejs", {})
  const typesResult = await compile("vue-types.ejs", {})

  // 3.将result写入到.vue文件中
  // 4.放到对应的文件夹中
  const targetDest = path.resolve(dest, name.toLowerCase())
  if (createDirSync(targetDest)) {
    const storePath = path.resolve(targetDest, `${name}.js`)
    const typesPath = path.resolve(targetDest, 'types.js')
    writeToFile(storePath, storeResult)
    writeToFile(typesPath, typesResult)
  }
}

module.exports = {
  createProjectAction,
  addComponentAction,
  addPageAndRouteAction,
  addStoreAction
}
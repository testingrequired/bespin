import { GluegunCommand } from 'gluegun'

const command: GluegunCommand = {
  name: 'cli',
  run: async toolbox => {
    const { print } = toolbox

    print.info('bespin!')
  }
}

module.exports = command

import { Argv, Arguments } from 'yargs'
import config from '../../config'
import Backup from '../../service/backup'
import { logger } from '../../../util'
import { onCancel, ParamsError } from '../../../util/error'
import prompts from 'prompts'

export const command = 'export'

export const desc = '匯出現有的 Quorum Network.'

interface OptType {
  interactive: boolean
}

export const builder = (yargs: Argv<OptType>) => {
  return yargs
    .example('bdk quorum backup export --interactive', 'Cathay BDK 互動式問答')
    .example('bdk quorum backup export --all', '備份 BDK 資料夾下所有 Quorum Network 資料')
    .option('interactive', { type: 'boolean', description: '是否使用 Cathay BDK 互動式問答', alias: 'i' })
    .option('all', { type: 'boolean', description: '是否備份所有資料', alias: 'a' })
}

export const handler = async (argv: Arguments<OptType>) => {
  const backup = new Backup(config)

  if (argv.all) {
    await backup.exportAll()
    logger.info('Quorum Network export all Successfully!')
  } else if (argv.interactive) {
    const node: string = await (async () => {
      const nodeList = backup.getExportItems()
      if (nodeList.length !== 0) {
        return (await prompts({
          type: 'select',
          name: 'node',
          message: 'Which node you want to export?',
          choices: nodeList,
        }, { onCancel })).node
      } else {
        throw new ParamsError('Invalid params: Required node not exist')
      }
    })()

    await backup.export(node)
    logger.info(`Quorum Network export ${node} Successfully!`)
  } else {
    throw new ParamsError('Invalid params: Required parameter missing')
  }
}

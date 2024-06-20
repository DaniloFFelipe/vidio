import { S3 } from '@aws-sdk/client-s3'

export const storage = new S3({
  endpoint: 'http://192.168.15.2:9000',
  region: 'eu-west-1',
  credentials: {
    accessKeyId: 'NYfOFZEM9L1iZ5ijNzzJ',
    secretAccessKey: '0dYmHVsOIWPF5qOZ45rU7afNZ4N1yyBRyByKTMh0',
  },
})

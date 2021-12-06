const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const { bgRed } = require('chalk')

operation()

function operation() {
    inquirer.prompt([{
        type: 'list',
        name: 'action',
        message: 'O que você vai querer hoje?',
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair'
        ]
    }])
        .then(answer => {
            const action = answer['action']
            if (action === 'Criar conta') {
                createAccount()
            } else if (action === 'Consultar saldo') {
                consult()
            } else if (action === 'Depositar') {
                deposit()
            } else if (action === 'Sacar') {
                withdraw()
            } else if (action === 'Sair') {
                console.log(chalk.bgGray.black('Obrigado por usar o Accounts!'))
                process.exit()
            }
        })
        .catch(err => console.log(err))
}

// CREATE ACCOUNT
function createAccount() {
    console.log(chalk.bgGreen.black("Obrigado por escolher o nosso banco! Sempre estaremos aqui por você!"))
    console.log(chalk.bgBlue.black("Defina as opções da sua conta a seguir!"))
    buildAccount()
}
function buildAccount() {
    inquirer.prompt([{
        name: 'accountName',
        message: 'Informe o nome da sua conta: '
    }])
        .then(answer => {
            const accountName = answer['accountName']

            console.info(accountName)

            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }

            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black(`O nome '${accountName}' já existe, por favor insira outro!`))
                buildAccount()
                return
            }

            fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}', function (err) {
                console.log(err)
            })

            console.log(chalk.bgGreen.black(`Parabéns ${accountName} sua conta foi criada!`))
            operation()
        })
        .catch(err => console.log(err))
}

// adicionar valor a conta do usuario
function deposit() {

    inquirer.prompt([{
        name: 'accountName',
        message: 'Qual o nome da sua conta?'
    }])
        .then(answer => {
            const accountName = answer['accountName']

            if (!checkAccount(accountName)) {
                return deposit()
            }
            inquirer.prompt([{
                name: 'amount',
                message: 'Informe a quantia que deseja depositar: '
            }])
                .then(answer => {
                    const amount = answer['amount']

                    if (amount < 0) {
                        console.log(chalk.bgRed.black("O valor inserido foi negativo, tente novamente!"))
                        deposit()
                        return
                    } else if (amount > 100000) {
                        console.log(chalk.bgRed.black("O valor inserido foi maior que 100.000, tente novamente!"))
                        deposit()
                        return
                    }
                    addAmount(accountName, amount)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

}

// deposit
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )
    console.log(chalk.bgGreen.black(`Foi depositado com sucesso um total de R$${amount} na sua conta!`))
    operation()
}
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

// consult
function consult() {
    inquirer.prompt([{
        name: 'consult',
        message: 'Qual conta você deseja consultar? '
    }])
        .then(answer => {
            const accountName = answer['consult']

            if (!checkAccount(accountName)) {
                return consult()
            }
            searchConsult(accountName)
        })
        .catch(err => console.log(err))

}
function searchConsult(accountName) {
    const accountData = getAccount(accountName)
    console.log(chalk.bgGreen.black(`Saldo da conta: R$${accountData.balance}`))
    operation()
}

// withdraw
function withdraw() {
    inquirer.prompt([{
        name: 'account',
        message: 'Informe a conta que deseja selecionar: '
    }])
        .then(answer => {
            const accountName = answer['account']

            if (!checkAccount(accountName)) {
                return withdraw()
            }

            inquirer.prompt([{
                name: 'withdraw',
                message: 'Informe a quantia que deseja sacar: '
            }])
                .then(answer=>{
                    const amount = answer['withdraw']

                    if(!amount){
                        console.log(chalk.bgRed.black('O valor digitado é nulo! Tente novamente!'))
                        return withdraw()
                    }else if(amount < 0){
                        console.log(chalk.bgRed.black('O valor digitado é negativo! Tente novamente!'))
                        return withdraw()
                    }
                    removeAmount(accountName, amount)
                })
                .catch(err => console.log(err))
        })
        .catch(err => console.log(err))
}
function removeAmount(accountName, amount){
    if (!amount) {
        console.log(chalk.bgRed.black('asdasdOcorreu um erro, tente novamente mais tarde!'))
        return withdraw()
    }
    const accountData = getAccount(accountName)
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    if(accountData.balance < 0){
        console.log(chalk.bgRed.black('O valor passado é maior que a quantidade que você tem no banco!'))
        return withdraw()
    }


    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )
    console.log(chalk.bgGreen.black(`Foi retirado com sucesso um total de R$${amount} na sua conta!`))
    operation()
}

// helper
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('A conta que você informou não existe, por favor tente novamente!'))
        return false
    }

    return true
}
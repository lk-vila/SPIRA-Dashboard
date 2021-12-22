<h1 align="center">SPIRA DASHBOARD - LABXP</h1>

![GitHub deployments](https://img.shields.io/github/deployments/lk-vila/SPIRA-Dashboard/spira-dashboard-demo)   [![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Flk-vila%2FSPIRA-Dashboard%2Fbadge%3Fref%3Dmain&style=flat)](https://actions-badge.atrox.dev/lk-vila/SPIRA-Dashboard/goto?ref=main)   [![Coverage Badge](https://img.shields.io/endpoint?url=https://gist.githubusercontent.com/lk-vila/1013be5684953ab9aa1dec8d2d663c6d/raw/SPIRA-Dashboard__heads_main.json)]

<p align="center">
  <img src="assets/preview.png" alt="Tree">
</p>
<p align="center">
  <i>Projeto do <a href="http://ccsl.ime.usp.br/wiki/LabXP2021">LabXP</a> em parceria com o <a href="https://spira.ime.usp.br/">SPIRA.</a></i>
</p>


<br>

## <b>Tabela de Conteúdo</b>
 - [Sobre o Projeto](#sobre-o-projeto)
    - [Integrantes](#integrantes)
    - [Ferramentas Utilizadas](#ferramentas-utilizadas)
 - [Fazendo o Deploy](#fazendo-o-deploy)
    - [Pré-requisitos](#pré-requisitos)
    - [Variáveis de Ambiente](#variáveis-de-ambiente)
    - [Deploy Local](#deploy-local)
    - [Deploy em Nuvem](#deploy-em-nuvem)
 - [Futuros Passos](#futuros-passos)

## Sobre o Projeto

SPIRA Dashboard é uma plataforma para registro e inferência de probabilidade de insuficiência respiratória usando uma instância da [SPIRA-Inference-API](https://github.com/lk-vila/SPIRA-Inference-API)

### Integrantes do time de LabXP

- <b>João Vitor Soares</b>
- <b>Leonardo Meireles da Silva</b>
- <b>Lucas Vilela Aleixo</b>
- <b>Raul Mello Silva</b>
- <b>Vitor Daisuke Tamae</b>
- <b>Ygor Sad Machado</b>

### Ferramentas Utilizadas

 - [TypeScript](https://www.typescriptlang.org/)
 - [Express](https://expressjs.com/pt-br/)
 - [Docker](https://www.docker.com/)
 - [MongoDB](https://www.mongodb.com/)
 - [Jestjs](https://jestjs.io/)

## Fazendo o Deploy
### Pré-requisitos
#### Utilizando Docker

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Portainer](https://hub.docker.com/r/portainer/portainer-ce) (Opcional, para gerenciamento de container)

#### Sem Docker (Direto na Máquina)

- [Yarn](https://yarnpkg.com/)

Todas as outras dependências podem ser instaladas por meio do Yarn, no diretório raíz do projeto (caso não tenha instalado todas as dependências):

    yarn install --production


#### Para Desenvolvimento

Caso queira instalar também as dependências de desenvolvimento do projeto:

    yarn install

###  Variáveis de Ambiente

As variáveis de ambiente devem ser colocadas no arquivo `.env` no diretório raíz do projeto. 

| Nome da Variável           | Significado                                                                                        | Obrigatória               |
|----------------------------|----------------------------------------------------------------------------------------------------|---------------------------|
| MONGO_INITDB_ROOT_USERNAME | nome do usuário root do banco de dados                                                             | Sim                       |
| MONGO_INITDB_ROOT_PASSWORD | senha do usuário root do banco de dados                                                            | Sim                       |
| SPIRA_API_URL              | url de acesso à instância da [SPIRA-Inference-API](https://github.com/lk-vila/SPIRA-Inference-API) | Sim                       |
| MONGO_PROTOCOL             | protocolo da url de acesso ao banco de dados                                                       | Não (default=`mongodb`)   |
| MONGO_AT                   | parte depois do @ na url de acesso ao banco de dados                                               | Não (default=`db:27017/`) |
| PORT                       | porta na qual o serviço vai rodar                                                                  | Não (default=`8000`)      |

Exemplo de `.env`:

    MONGO_INITDB_ROOT_USERNAME=admin
    MONGO_INITDB_ROOT_PASSWORD=PEjJIU4mLSfMXLI
    SPIRA_API_URL=http://localhost:5000/predict

### Deploy Local

O deploy local pode ser feito tanto com Docker quanto direto na máquina.

#### Utilizando Docker

Primeiro, é necessário criar a imagem. Esse passo só é executado uma vez ou sempre que for feita uma atualização no código:

    bash scripts/build.sh

- Sem Portainer:

  Executado sempre que for subir os containers:

      bash scripts/compose.sh

- Com Portainer:

  Com o Portainer configurado e rodando, entre no seu ambiente em `Environments`, vá em `Stacks` e clique em `Add stack`.

  Selecione `Upload`, selecione `Select file` e busque o arquivo `docker-compose.yml` do projeto.

  Selecione `Load variables from .env file` e busque o arquivo `.env` com suas variáveis de ambiente. No caso de uso do Portainer, é necessário que a variável PORT seja definida no arquivo `.env`.

  `Deploy the stack`!

#### Sem Docker (Direto na Máquina)

É necessário que uma instância de MongoDB esteja rodando na máquina ou em outro lugar acessível (pode ser em um Docker container, inclusive). 

Defina as váriáveis MONGO_PROTOCOL e MONGO_AT no arquivo `.env` conforme a configuração da instância de MongoDB que for usar.

Execute o seguinte comando no diretório raíz do projeto:

    yarn start

Caso o deploy seja para **desenvolvimento**, é possível fazer o redeploy automático quando detectadas mudanças no código. Tenha as dependências de desenvolvimento instaladas e execute:

    yarn dev

### Deploy em Nuvem

Esse tipo de deploy pode variar bastante dependendo do serviço que for usar. 

Assim é feito o deploy em nuvem desse repositório, usando o *free tier* do [Heroku](https://www.heroku.com/) e do [MongoDB Atlas](https://www.mongodb.com/atlas):


#### Atlas

- Crie uma conta e uma database (Shared) no Atlas
- Configure o [IP range aceito para conexões](https://docs.atlas.mongodb.com/connect-to-cluster/#ip-access-list)
- Na aba `Connect`, selecione a opção `Connect your application`
  - Decomponha a url mostrada nas variáveis de ambiente
#### Heroku

- Crie uma conta e um App no Heroku
- Faça a [migração do stack](https://devcenter.heroku.com/articles/stack#migrating-to-a-new-stack) para container
- Faça a [integração com o Github](https://devcenter.heroku.com/articles/github-integration#enabling-github-integration)
- Habilite o [deploy automático](https://devcenter.heroku.com/articles/github-integration#automatic-deploys)
- Defina as variáveis de ambiente com [config vars](https://devcenter.heroku.com/articles/config-vars)





## Futuros Passos
Confira as [issues](/../../issues/).
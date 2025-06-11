# Airbnb Scraper API

## Descrição
Este projeto é uma API para realizar web scraping de anúncios do Airbnb. Ele utiliza o Puppeteer para navegar e capturar informações das páginas do Airbnb e o Cheerio para processar o HTML extraído.

## Funcionalidades
1. **Raspagem de dados do Airbnb**:
   - Captura informações como nome, ID do quarto, número total de avaliações, pontuação e preço dos anúncios.

2. **Paginação**:
   - Suporta a navegação por múltiplas páginas de resultados.

3. **Configuração de espera**:
   - Permite configurar um tempo de espera entre as requisições para evitar bloqueios.

4. **API REST**:
   - Endpoint para iniciar a raspagem e retornar os dados capturados.

## Passo a Passo do Funcionamento
1. **Inicialização do Servidor**:
   - O servidor Express é iniciado na porta 3000.

2. **Recebimento de Requisição**:
   - O cliente faz uma requisição POST para o endpoint `/scrape` com os seguintes parâmetros:
     - `max_pages`: Número máximo de páginas a serem raspadas.
     - `enable_wait`: Booleano para ativar ou desativar o tempo de espera entre as requisições.

3. **Construção da URL**:
   - A URL base do Airbnb é configurada com os parâmetros necessários para a busca.

4. **Navegação com Puppeteer**:
   - O Puppeteer é utilizado para abrir a página do Airbnb e navegar pelos resultados.
   - O script aguarda até que um número mínimo de elementos seja carregado na página.

5. **Extração de Dados**:
   - O HTML dos elementos é capturado e processado com o Cheerio.
   - Funções específicas extraem informações como nome, ID do quarto, número de avaliações, pontuação e preço.

6. **Paginação**:
   - Para cada página, o script calcula o cursor e constrói a URL para a próxima página.

7. **Formatação dos Dados**:
   - Os dados capturados são formatados em um array com informações estruturadas.

8. **Retorno da Resposta**:
   - A API retorna os dados capturados em formato JSON para o cliente.

## Estrutura do Projeto
- `index.js`: Arquivo principal que contém a lógica da API e do scraping.
- `scrapers/`: Contém funções específicas para extrair informações do HTML.
- `package.json`: Gerenciamento de dependências do projeto.

## Dependências
- Puppeteer
- Express
- Cheerio

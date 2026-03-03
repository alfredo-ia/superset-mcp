# Servidor MCP do Superset

> Este projeto é um **fork** mantido pela organização **alfredo-ia** a partir do repositório original `winding2020/superset-mcp`.

Um servidor Model Context Protocol (MCP) para gerenciar datasets, métricas e consultas SQL do Apache Superset.

## 🚀 Funcionalidades

- **Gestão de Datasets**: Operações completas de CRUD para datasets do Superset
- **Gestão de Métricas**: Criar, atualizar e gerenciar métricas de datasets
- **Colunas Calculadas**: Criar e gerenciar colunas calculadas para datasets
- **Gestão de Gráficos**: Visualizar e modificar parâmetros de visualização e filtros
- **Operações de Dashboards**: Acessar informações de dashboards, gráficos e filtros
- **Execução de SQL**: Executar consultas SQL diretamente pelo Superset
- **Integração com Banco de Dados**: Listar e gerenciar conexões de banco
- **Acesso a Recursos**: Navegar por datasets, bancos e métricas via recursos MCP

## 📋 Pré-requisitos

- Node.js 18+
- Acesso a uma instância do Apache Superset
- Cookie de sessão web válido do Superset

## 🛠️ Instalação

#### 1. Adicione na configuração de MCP
Adicione a configuração abaixo no arquivo de configuração de MCP:

```json
{
  "mcpServers": {
    "superset-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "alfredo-superset-mcp@latest"
      ],
      "env": {
        "SUPERSET_BASE_URL": "",
        "SUPERSET_SESSION_COOKIE": "",
        "SUPERSET_CSRF_TOKEN": ""
      }
    }
  }
}
```

#### 2. Configure as variáveis de ambiente
Configure a conexão com o Superset atualizando a seção `env`:

```json
"env": {
  "SUPERSET_BASE_URL": "https://seu-superset.exemplo.com",
  "SUPERSET_SESSION_COOKIE": "<valor-da-session>",
  "SUPERSET_CSRF_TOKEN": "<csrf-token-opcional>"
}
```

#### 3. Como obter o `SUPERSET_SESSION_COOKIE` no navegador (F12)
1. Abra o Superset no navegador e faça login normalmente.
2. Com o Superset aberto, pressione `F12` para abrir o DevTools (Inspecionar elemento).
3. Vá para a aba `Application`.
4. No menu lateral, clique em `Cookies`.
5. Clique no item do domínio/URL do seu Superset.
6. Procure a linha com `Name = session`.
7. Copie o valor da coluna `Value`.
8. Use **somente esse valor** em `SUPERSET_SESSION_COOKIE` (sem `session=`).

Observações:
- Este MCP usa autenticação **somente por cookie de sessão**.
- `SUPERSET_CSRF_TOKEN` é **opcional**.
- Se `SUPERSET_CSRF_TOKEN` não for informado, o MCP tenta obter o token automaticamente via API do Superset.
- Em ambientes com proxy/WAF/políticas mais restritivas, pode ser necessário informar `SUPERSET_CSRF_TOKEN` manualmente.
- Cookies de sessão expiram; quando isso acontecer, atualize os valores a partir de uma sessão autenticada no navegador.

## 🔧 Ferramentas disponíveis

### Operações de Datasets
| Ferramenta | Descrição |
|------|-------------|
| `list_datasets` | Retorna uma lista paginada de datasets com filtros e ordenação |
| `get_dataset` | Retorna informações detalhadas de um dataset específico |
| `create_dataset` | Cria um novo dataset (físico ou virtual com SQL) |
| `update_dataset` | Atualiza propriedades de um dataset existente |
| `delete_dataset` | Remove um dataset |
| `refresh_dataset_schema` | Atualiza o schema do dataset a partir da origem |
| `find_and_replace_in_sql` | Localiza e substitui texto no SQL de dataset virtual |

### Operações de Métricas
| Ferramenta | Descrição |
|------|-------------|
| `get_dataset_metrics` | Retorna todas as métricas de um dataset |
| `create_dataset_metric` | Cria uma nova métrica com expressão SQL |
| `update_dataset_metric` | Atualiza propriedades de uma métrica existente |
| `delete_dataset_metric` | Remove uma métrica |

### Operações de Colunas Calculadas
| Ferramenta | Descrição |
|------|-------------|
| `get_dataset_columns` | Retorna informações de colunas (incluindo calculadas) |
| `create_calculated_column` | Cria uma nova coluna calculada com expressão SQL |
| `update_calculated_column` | Atualiza uma coluna calculada existente |
| `delete_calculated_column` | Remove uma coluna calculada |

### Operações de Gráficos
| Ferramenta | Descrição |
|------|-------------|
| `list_charts` | Retorna uma lista paginada de gráficos com filtros e ordenação |
| `create_chart` | Cria um novo gráfico; para a maioria dos tipos, chame antes `get_chart_params` para obter o schema correto |
| `get_chart_params` | Retorna o formato de parâmetros necessário para tipos de visualização |
| `get_current_chart_config` | Retorna detalhes da configuração atual do gráfico (parâmetros, relacionamentos, ownership, query context) |
| `update_chart` | Atualiza propriedades do gráfico, incluindo metadados, datasource e parâmetros |
| `get_chart_filters` | Retorna os filtros de dados atualmente aplicados ao gráfico |
| `set_chart_filters` | Define filtros de dados para o gráfico (atualiza permanentemente) |

### Operações de Dashboards
| Ferramenta | Descrição |
|------|-------------|
| `list_dashboards` | Retorna uma lista paginada de dashboards com filtros e ordenação |
| `get_dashboard_charts` | Retorna todos os gráficos de um dashboard específico com suas informações |
| `get_dashboard_filters` | Retorna a configuração de filtros do dashboard (filtros nativos e globais) |
| `get_dashboard_chart_query_context` | Retorna o query context completo de um gráfico no dashboard (dataset, métricas, colunas calculadas, filtros) |
| `get_dashboard_config` | Retorna detalhes e configuração de embed do dashboard |
| `update_dashboard_config` | Atualiza propriedades e/ou configuração de embed do dashboard |
| `add_chart_to_dashboard` | Adiciona um gráfico existente ao dashboard e posiciona no layout |
| `remove_chart_from_dashboard` | Remove um gráfico do dashboard e limpa o layout |

### Operações SQL
| Ferramenta | Descrição |
|------|-------------|
| `execute_sql` | Executa consultas SQL com limite de resultados e exibição de dados |

### Operações de Banco de Dados
| Ferramenta | Descrição |
|------|-------------|
| `list_databases` | Retorna todas as conexões de banco de dados configuradas |

## 📚 Recursos

Acesse visões gerais somente leitura por meio dos recursos MCP:

- `superset://datasets` - Visão geral de todos os datasets
- `superset://databases` - Lista de conexões de banco de dados

## Exemplos de prompts

Use estes prompts naturais com seu assistente habilitado para MCP; ele escolherá as ferramentas e argumentos corretos.

- Listar datasets
  - "Mostre os 10 primeiros datasets, ordenados pelos mais recentemente alterados. Inclua apenas id e table_name."

- Criar um gráfico
  - "Crie um gráfico de tabela simples chamado 'Sample Table' usando o dataset 12."

- Atualizar um gráfico
  - "Altere o gráfico 42 para um gráfico de barras agrupado por país usando SUM(value)."

- Query context de dashboard
  - "No dashboard 'sales-kpi', mostre o query context completo do gráfico 101."

- Executar SQL
  - "No banco 3, busque os 10 usuários criados mais recentemente, retornando apenas id e name."

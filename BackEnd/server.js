const express = require('express');
const app = express();
const { Client } = require('@notionhq/client');

const cors = require('cors');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

require('dotenv').config();


app.use(bodyParser.json());


const notion = new Client({ auth: process.env.NOTION_API_TOKEN });


app.get('/NotionAPIGet', async (req, res) => {
    try {
        // 프론트로 부터  데이터베이스 아이디를 받고 해당 데이터 베이스 정보를 받음
        const databaseId = req.body.databaseId;
        
        const response = await notion.databases.query({
            database_id: databaseId,
            sorts: [
                {
                    property: '날짜', // 날짜 필드의 이름으로 바꿔주세요
                    direction: 'ascending', // 역순으로 정렬합니다
                }
            ]
        });
        const responseData = response.results;
        res.json(responseData);
    } catch (error) {
        console.error('Error retrieving Notion database:', error);
        res.status(500).json({ error: 'Failed to retrieve Notion database' });
    }
});


app.post('/NotionAPIPost', jsonParser, async (req, res) => {
    const { Fullname, CompanyRole, Location } = req.body;

    try {
        const response = await notion.pages.create({
            parent: {
                database_id: notionDbID,
            },
            properties: {
                Fullname: {
                    title: [
                        {
                            text: {
                                content: Fullname
                            },
                        },
                    ],
                },
                CompanyRole: {
                    rich_text: [
                        {
                            text: {
                                content: CompanyRole
                            },
                        },
                    ],
                },
                Location: {
                    rich_text: [
                        {
                            text: {
                                content: Location
                            },
                        },
                    ],
                },
            },
        });

        console.log("success");
        res.send(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.delete('/NotionAPIDelete/:pageId', async (req, res) => {
    const { pageId } = req.params;

    try {
        await notion.pages.update({
            page_id: pageId,
            archived: true // 페이지를 아카이브하여 삭제처리합니다.
        });
        res.status(204).send(); // 성공적으로 삭제됐음을 응답합니다.
    } catch (error) {
        console.error('Error deleting Notion page:', error);
        res.status(500).json({ error: 'Failed to delete Notion page' });
    }
});

app.put('/NotionAPIPut/:pageId', jsonParser, async (req, res) => {
    const { pageId } = req.params;
    const { Fullname, CompanyRole, Location } = req.body;

    try {
        await notion.pages.update({
            page_id: pageId,
            properties: {
                Fullname: {
                    title: [
                        {
                            text: {
                                content: Fullname
                            },
                        },
                    ],
                },
                CompanyRole: {
                    rich_text: [
                        {
                            text: {
                                content: CompanyRole
                            },
                        },
                    ],
                },
                Location: {
                    rich_text: [
                        {
                            text: {
                                content: Location
                            },
                        },
                    ],
                },
            },
        });

        console.log("success");
        res.status(204).send(); // 성공적으로 업데이트됐음을 응답합니다.
    } catch (error) {
        console.error('Error updating Notion page:', error);
        res.status(500).json({ error: 'Failed to update Notion page' });
    }
});




const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
import axios from "axios";
import fs from 'fs';

import pkg from 'lodash';
import {makeKeyFromString,findTableSectionByHeader,removeHtmlTags,parseMarkdownTable} from './utils.js';
import {sendMsg} from './discord.js'

import {saveItem,getItem,removeDir} from './database.js'

import 'firebase/compat/database';

const {isEqual} = pkg;

interface ChangedItem {
  [key: string]: {[key: string]:Array<Object>};
}

async function doRepoCheck(postMsg:Boolean){
  try {
    const data = await readRepoList();
    const jsonData = JSON.parse(data as string);
    let changedItem:ChangedItem = {};
    // Accessing every element in the repoList array
    for (const item of jsonData.repoList){

      if(!changedItem[`${item.note}`]){
        changedItem[`${item.note}`]={}
      }

      const readme = await fetchReadme(item.owner, item.repo);
      const section = findTableSectionByHeader(readme,item.header)

      if (section != null){
        const parsedTable = parseMarkdownTable(section!);

        console.log('Owner:', item.owner);
        console.log('Repo:', item.repo);
        console.log('Header:', item.header);
        console.log('-------------------');
        
        if(!changedItem[`${item.note}`][`https://github.com/${item.owner}/${item.repo}/`]){
          changedItem[`${item.note}`][`https://github.com/${item.owner}/${item.repo}/`] = []
        }
        
        for (const row of parsedTable) {
          if(!row){
            break;
          }
          // console.log("Row",row)
          // console.log("Item",item)
          const key = makeKeyFromString(row[item.key]);
          const dataRef:string = `/jobAlert/${item.owner}/${item.repo}/${item.note}/${key}`;
          
          // Fetch the existing data from the database
          const existingData = await getItem(dataRef);
        
          if (!existingData) {
            // If there is no existing data, store the current row data in the database
            await saveItem(dataRef,[row]);
            console.log('Data saved in the database:', row);
            
            changedItem[`${item.note}`][`https://github.com/${item.owner}/${item.repo}/`].push(row);
            console.log(changedItem[`${item.note}`][`https://github.com/${item.owner}/${item.repo}/`])
          }
          else{
            // If the existing data and the new data are not the same, update the data in the database
            let flag = true;
            for(const d of existingData) {
              if(isEqual(d, row)) {
                flag = false;
              }
            }
                        
            if(flag){
              console.log('Data updated in the database:', row);
              await saveItem(dataRef,existingData.concat([row]));
              changedItem[`${item.note}`][`https://github.com/${item.owner}/${item.repo}/`].push(row);
              console.log(changedItem[`${item.note}`][`https://github.com/${item.owner}/${item.repo}/`])
            }
            else{
              //console.log('Data in the database is the same, no update needed:');
            }
          }
        }
        
      }
      else  {
        console.log(`=================Could not find table====================`);
      }
    }
    console.log(changedItem)
    if(postMsg){
      const msgList = await constructMessage(changedItem)
      msgList[0] = "今天的更新來啦!\n" + msgList[0]
      for(const msg of msgList){
        if (msg === "今天的更新來啦!\n"){
          await sendMsg("1129177851036450837","今天沒有新的更新",undefined)
          //await sendMsg("1114429836082024458","今天沒有新的更新",undefined)
          return
        }else{
          await sendMsg("1129177851036450837",msg,undefined)
          //await sendMsg("1114429836082024458",msg,undefined)
        }
      }
    }

  } catch (error) {
    console.error('Invalid JSON:', error);
  }
  return
}

async function refreshJobRef(){
  await removeDir("/jobAlert");
  await doRepoCheck(false);
}

function readRepoList(loc:string = "repoList.json"){
  return new Promise((resolve, reject) => {
    fs.readFile("repoList.json", 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
async function fetchReadme(repoOwner: string, repoName: string): Promise<string> {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoOwner}/${repoName}/readme`);
    const { download_url } = response.data;
    const readmeResponse = await axios.get(download_url);
    return readmeResponse.data;
  } catch (error) {
    throw new Error(`Failed to fetch README`);
  }
}

/*
{
    "Graduate":
    {
        "https://github.com/Owner1/repo/":
        [
            {
                "name": "Company1",
                "title": "SDE1",
                "note": "Test"
            },
            {
                "name": "Company2",
                "title": "SDE2",
                "note": "Test"
            }
        ],
        "https://github.com/Owner2/repo/":
        [
            {
                "name": "Company3",
                "title": "SDE3",
                "note": "Test"
            },
            {
                "name": "Company3",
                "title": "SDE3",
                "note": "Test"
            } 
        ]
    },
    "Iternship":
    {
        "https://github.com/Owner1/repo/":
        [
            {
                "name": "Company1",
                "title": "SDE1",
                "note": "Test"
            },
            {
                "name": "Company2",
                "title": "SDE2",
                "note": "Test"
            }
        ],
        "https://github.com/Owner2/repo/":
        [
            {
                "name": "Company3",
                "title": "SDE3",
                "note": "Test"
            },
            {
                "name": "Company3",
                "title": "SDE3",
                "note": "Test"
            } 
        ]
    }
}
*/

function constructMessage(json: any): Promise<Array<string>> {
  return new Promise((resolve) => {
    let output = new Array<string>();
    let msg = ""
    Object.keys(json).forEach((key)=>{
      let noteFlag = false;
      Object.keys(json[key]).forEach((website)=>{
        let websiteFlag = false;
        for(const newAddition of json[key][website]){
          if (!noteFlag){
            msg += `\n${key}:\n\n`
            noteFlag = true
          }
          if (!websiteFlag){
            msg+= `\t${website}:\n\n`
            websiteFlag = true
          }
          let buffer = ""
          Object.keys(newAddition).forEach((contentKey)=>{
            buffer += `> \t\t${removeHtmlTags(contentKey)} : ${removeHtmlTags(newAddition[contentKey])}\n`;
          });
          if (msg.length + buffer.length > 1800){
            output.push(msg);
            msg = buffer
          }
          else{
            msg+=buffer
          }
          msg += `\n`
        }
      });
    });
    output.push(msg)
    resolve(output);
  });
}

export {
  doRepoCheck,
  refreshJobRef
}


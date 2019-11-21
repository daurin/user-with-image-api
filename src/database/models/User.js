var pool=require('../dbPool.js');
const Model =require('./Model');

class User extends Model{
    constructor(){
        super();
    }

    static get tableName(){return 'USER';};
    static get columns(){
        return [
            'id',
            'name',
            'last_name',
            'email',
            'password',
            'age',
            'picture'
        ];
    }

    static search(options={
            textSearch:'',
            equalsAnd:[{}],
            offset:0,
            limit:30,
            resultModels:false,
        }){
        const {textSearch='',offset=0,limit=10,resultModels=true,equalsAnd={}} =options;

        let query='SELECT *,COUNT(USER.id) OVER() AS total_rows FROM USER ',
            whereOr=[],whereAnd=[];

        // Where
        if(textSearch.length>0){
            let textSearchSplit=textSearch.trim().replace(/\s\s+/g,' ').split(' ');

            whereOr.push('MATCH(USER.id_custom,USER.email,USER.name,USER.last_name) '+
            `AGAINST('${textSearchSplit.map(v=>{
                return '+'+v+'*';
            }).join(' ')}' IN BOOLEAN MODE)`);
        }

        if(Object.keys(equalsAnd).length>0){
            for (const key in equalsAnd)whereAnd.push(`${key}=${pool.escape(equalsAnd[key])}`);
        }
        let where=[];
        if(whereAnd.length>0)where.push(whereAnd.join(' AND '));
        if(whereOr.length>0)where.push(whereOr.join(' OR '));
        if(where.length>0)query+=' WHERE '+where.join(' AND ');

        // Group
        //query+='GROUP BY BOOK.id ';

        // Sort
        //query+='ORDER BY BOOK.publication_date desc ';

        // Pagination
        if (offset >= 0 && limit > 0) query += `LIMIT ${offset},${limit}`;
        else if (options.limit > 0) query += `LIMIT ${limit}`;

        console.log(query);

        return pool.query(query)
            .then((res)=>{
                let result = {};

                if (resultModels === true) {
                    let models = [];
                    for (const item of res) {
                        let user = new User();
                        user=User.fromObject(item);
                        if (user.hasOwnProperty('total_rows')) delete user.total_rows;
                        models.push(user);
                    }
                    result.data = models;
                }
                else result.data = res;

                let total_items = res.length > 0 ? res[0].total_rows : 0;
                result.items=res.length,
                result.pages_count= res.length>0?Math.ceil(total_items / res.length):0,
                result.total_items=total_items;

                if (result.pages_count===NaN) delete res.pages;
                return Promise.resolve(result);
            });
    }

}

module.exports=User;
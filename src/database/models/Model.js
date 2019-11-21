const pool=require('../dbPool');

class Model{
    constructor(){
        for(const item of this.constructor.columns)this.item;
    }

    static get tableName(){return ''}
    static get columns(){return [];}

    static fromObject(obj){
        let model=new this;
        Object.assign(model,obj);
        delete model._tableName;
        return model;
    }

    static findByFields(fields,operator='AND'){
        let query=`SELECT * FROM ${this.tableName} WHERE `;
        let wheres=[];
        let entries= Object.entries(fields);
        for (const item of entries) {
            wheres.push(item[0] + ' = ' + pool.escape(item[1]));
        }
        query +=wheres.join(` ${operator} `);

        return pool.query(query)
            .then((result)=>{
                if(result.length===0)Promise.resolve(undefined);
                else return Promise.resolve(this.fromObject(result[0]));
            });
    }

    static findById(id){
        return this.findByFields({id});
    }

    static create(model){
        return pool.query(`INSERT INTO ${this.tableName} SET ?`,model);
    }

    static updateByFields(values,fields){
        return pool.query(`UPDATE ${this.tableName} SET ? WHERE ?`,[values,fields]);
    }

    static deleteById(id){
        return pool.query(`DELETE FROM ${this.tableName} WHERE id=?`,[id]);
    }

    static exist(fields,operator='AND'){
        let wheres=[];
        let entries= Object.entries(fields);
        for (const item of entries) wheres.push(item[0] + ' = ' + pool.escape(item[1]));
        return pool.query('SELECT EXISTS ('+`SELECT 1 FROM ${this.tableName} WHERE `+wheres.join(` ${operator} `)+')')
            .then((result)=>Promise.resolve(Object.values(result[0])[0]===1));
    }
}

module.exports=Model;
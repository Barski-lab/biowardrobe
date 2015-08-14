#include "iaintersect.hpp"




IAIntersect::IAIntersect(QObject *parent):
    QObject(parent)
{
    promoter=gArgs().getArgs("promoter").toInt();
    upstream=gArgs().getArgs("upstream").toInt();
}

IAIntersect::~IAIntersect()
{
}

void IAIntersect::fillUpAnnotation( ) {
    QSqlQuery q;
    q.prepare("select * from `"+db_name+"`.`"+an_tbl+"` where chrom not like '%control%' order by chrom,txStart,txEnd"); //chrom not like '%\\_%' and - random chr from hg
    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        throw "Error query to DB";
    }

    int fieldExCount = q.record().indexOf("exonCount");
    int fieldExStarts = q.record().indexOf("exonStarts");
    int fieldExEnds = q.record().indexOf("exonEnds");
    int fieldName = q.record().indexOf("name");
    int fieldName2 = q.record().indexOf("name2");
    int fieldChrom = q.record().indexOf("chrom");
    int fieldStrand = q.record().indexOf("strand");
    int fieldTxStart= q.record().indexOf("txStart");
    int fieldTxEnd= q.record().indexOf("txEnd");

    while(q.next()) {
        QStringList q_starts=q.value(fieldExStarts).toString().split(QChar(','));
        /*exon end positions*/
        QStringList q_ends=q.value(fieldExEnds).toString().split(QChar(','));
        /*exon count*/
        int exCount=q.value(fieldExCount).toInt();
        /*exon name*/
        /*chromosome name*/
        QString chr=q.value(fieldChrom).toString();
        QChar strand=q.value(fieldStrand).toString().at(0);
        /*iso name*/
        QString iso_name=q.value(fieldName).toString();
        /*gene name*/
        QString g_name=q.value(fieldName2).toString();
        quint64 txStart=q.value(fieldTxStart).toInt()+1;
        quint64 txEnd=q.value(fieldTxEnd).toInt();
        /*Variables to store start/end exon positions*/

        if(gArgs().getArgs("sam_ignorechr").toString().contains(chr)) {
            continue;
        }

        annotationPtr p(   new Annotation(chr,strand,exCount,q_starts,q_ends,iso_name,g_name,txStart,txEnd)   );

        QSet<annotationPtr> aptr; aptr.insert(p);

        if(strand=='+') {
            if(promoter+upstream >txStart)
                txStart=1;
            else
                txStart-=(promoter+upstream);
        } else {
            txEnd+=(promoter+upstream);
        }
        annotation[chr].add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(txStart,txEnd),aptr));
        for(int j=0;j<exCount;j++) {
            quint64 s=q_starts.at(j).toInt(),e=q_ends.at(j).toInt();
            annotation[chr].add(make_pair(bicl::discrete_interval<t_genome_coordinates>::closed(s,e),aptr));
        }

    }

}

void IAIntersect::getRecordInfo() {
    QSqlQuery q;
    if(gArgs().getArgs("uid").toString()!="") {
        q.prepare("select g.db,g.annottable,CONCAT(l.uid,'_islands') from labdata l,genome g where l.uid=? and g.id=l.genome_id");
        q.bindValue(0, gArgs().getArgs("uid").toString());
    }

    if(gArgs().getArgs("guid").toString()!="") {
        q.prepare("select g.db,g.annottable,gl.tableName from genelist gl,genome g where gl.id=? and gl.db=g.db");
        q.bindValue(0, gArgs().getArgs("guid").toString());
    }

    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        throw "Error query to DB";
    }
    q.next();
    db_name=q.value(0).toString();
    an_tbl=q.value(1).toString();
    tbl_name=q.value(2).toString();
}

void IAIntersect::start()
{
    this->getRecordInfo();
    this->fillUpAnnotation();
    QString tableName;

    QSqlQuery q;
    tableName=this->tbl_name;
    q.prepare("describe `"+gSettings().getValue("experimentsdb")+"`.`"+tableName+"`");
    if(!q.exec()) {
        qDebug()<<"Cant describe "<<q.lastError().text();
        throw "Error describe";
    }
    q.next();
    bool alter=(q.value(0).toString()!="refseq_id");
    q.clear();
    //FIXIT change behavior later - just run each time!
//    if(!alter && promoter==1000 && upstream==20000) {
//        emit finished();
//        return;
//    }
    //Fix table if no needed column
    if(alter) {
        if(!q.exec("ALTER TABLE `"+gSettings().getValue("experimentsdb")+"`.`"+tableName+"`"
                   "ADD COLUMN `refseq_id` VARCHAR(500) NULL FIRST,"
                   "ADD COLUMN `gene_id` VARCHAR(500) NULL AFTER `refseq_id`,"
                   "ADD COLUMN `txStart` INT NULL after gene_id,"
                   "ADD COLUMN `txEnd` INT NULL after txStart,"
                   "ADD COLUMN `strand` VARCHAR(1) after txEnd,"
                   "ADD COLUMN `region` VARCHAR(50),"
                   "ADD INDEX `region_idx` USING BTREE (`region` ASC),"
                   "ADD INDEX `txEnd_idx` USING BTREE (`txEnd` ASC),"
                   "ADD INDEX `txStart_idx` USING BTREE (`txStart` ASC),"
                   "ADD INDEX `gene_idx` USING BTREE (`gene_id`(100) ASC),"
                   "ADD INDEX `strand` USING BTREE (`strand` ASC),"
                   "ADD INDEX `refseq_idx` USING BTREE (`refseq_id`(100) ASC);"
                   )){
            qDebug()<<"Cant alter"<<q.lastError().text();
            throw "Error alter";
        }
        q.clear();
    }
    //Select Islands
    q.prepare("select distinct chrom,start,end from `"+gSettings().getValue("experimentsdb")+"`.`"+tableName+"` order by chrom,start,end ");
    if(!q.exec()) {
        qDebug()<<"Query error info: "<<q.lastError().text();
        throw "Error query to DB";
    }

    while(q.next()) {
        QStringList GENE_NAME;
        QStringList REFSEQ_NAME;
        int txStart;
        int txEnd;
        QChar strand;

        QString chr=q.value(0).toString();
        int start=q.value(1).toInt();
        int end=q.value(2).toInt();
        if(!annotation.keys().contains(chr)) continue;

        bicl::discrete_interval<t_genome_coordinates> current_region=bicl::discrete_interval<t_genome_coordinates>::closed(start,end);
        pair<chrom_coverage::iterator,chrom_coverage::iterator> pi=annotation[chr].equal_range(current_region);

        if(pi.first==pi.second) {
            chrom_coverage::iterator itl=annotation[chr].lower_bound(current_region);
            chrom_coverage::iterator itu=annotation[chr].upper_bound(current_region);
            chrom_coverage::iterator it;
            if(itl==annotation[chr].end())
                itl--;
            if(itu==annotation[chr].end())
                itu--;
            if(itl==annotation[chr].end() && itu==annotation[chr].end())
                continue;
            if(itl!=annotation[chr].end() && itu!=annotation[chr].end()) {
                if(itl->first.lower()-end < start-itu->first.upper())
                    it=itl;
                else
                    it=itu;
            }
            else if(itu==annotation[chr].end())
                it=itl;
            else
                it=itu;

            QSetIterator<annotationPtr> i((*it).second);

            while(i.hasNext()){
                annotationPtr p(i.next());
                if(GENE_NAME.isEmpty()) {
                    txStart=p->txStart;
                    txEnd=p->txEnd;
                    strand=p->strand;
                }
                if(!GENE_NAME.contains(p->name2))
                    GENE_NAME<<p->name2;
                if(!REFSEQ_NAME.contains(p->name))
                    REFSEQ_NAME<<p->name;
            }
            GENE_NAME.sort();
            REFSEQ_NAME.sort();
            QString gene_name,refseq_name;
            gene_name=GENE_NAME.value(0);
            refseq_name=REFSEQ_NAME.value(0);
            for(int i=1;i<GENE_NAME.count();i++){
                gene_name+=","+GENE_NAME.value(i);
                refseq_name+=","+REFSEQ_NAME.value(i);
            }
            QSqlQuery _q;
            _q.prepare("update `"+gSettings().getValue("experimentsdb")+"`.`"+tableName+"` "
                      "set refseq_id=?,gene_id=?,txStart=?,txEnd=?,strand=?,region='intergenic' where chrom=? and start=? and end=?");
            _q.bindValue(0,refseq_name);
            _q.bindValue(1,gene_name);
            _q.bindValue(2,txStart);
            _q.bindValue(3,txEnd);
            _q.bindValue(4,strand);
            _q.bindValue(5,chr);
            _q.bindValue(6,start);
            _q.bindValue(7,end);
            if(!_q.exec()) {
                qDebug()<<"Query error info: "<<_q.lastError().text();
                throw "Error query to DB";
            }
            continue;
        }
        QMap<int,QSet<annotationPtr> > result;

        while(pi.first!=pi.second){
            //chrom_coverage::interval_type itv = bicl::key_value<chrom_coverage >(pi.first);
            //qDebug()<<chr<<"["<<itv.lower()<<":"<<itv.upper()<<"]=["<<start<<":"<<end<<"]";

            QSetIterator<annotationPtr> i((*(pi.first)).second);
            while(i.hasNext()){
                annotationPtr p(i.next());
                bicl::discrete_interval<t_genome_coordinates> _promoter;
                bicl::discrete_interval<t_genome_coordinates> _upstream;
                bicl::discrete_interval<t_genome_coordinates> _gene;

                if(p->strand=='+') {
                    qint64 beg=p->txStart-promoter;
                    _promoter =bicl::discrete_interval<t_genome_coordinates>::closed( ( beg< 0 ) ? 0: (beg),p->txStart+promoter);
                    beg-=upstream;
                    _upstream=bicl::discrete_interval<t_genome_coordinates>::closed( (beg)? 0: (beg),p->txStart-promoter);
                } else {
                    qint64 beg=p->txEnd-promoter;
                    _promoter =bicl::discrete_interval<t_genome_coordinates>::closed( (beg <0 )?0:(beg),p->txEnd+promoter);
                    _upstream =bicl::discrete_interval<t_genome_coordinates>::closed( p->txEnd+promoter,p->txEnd+promoter+upstream);
                }
                _gene =bicl::discrete_interval<t_genome_coordinates>::closed(p->txStart,p->txEnd);


                //is promoter
                if(bicl::intersects(current_region,_promoter)) {
                    result[1].insert(p);
                    continue;
                }

                if(result.contains(1))//skeep all others if promoter exists
                    continue;
                //is intron
                if(bicl::intersects(current_region,_gene)) {
                    result[3].insert(p);
                }

                //is Exon
                bicl::interval_set<t_genome_coordinates> _exons;
                for(int j=0;j<p->exonCount;j++) {
                    quint64 s=p->exonStarts.at(j).toInt(),e=p->exonEnds.at(j).toInt();
                    _exons.add(bicl::discrete_interval<t_genome_coordinates>::closed(s,e));
                }

                if(bicl::intersects(_exons,current_region)) {
                    result[2].insert(p);
                    continue;
                }
                if(result.contains(2) || result.contains(3))//skeep all others
                    continue;

                //is upstream
                if(bicl::intersects(current_region,_upstream)) {
                    result[4].insert(p);
                    //                    qDebug()<<chr<<"["<<_promoter.lower()<<":"<<_promoter.upper()<<"]=["<<current_region.lower()<<":"<<current_region.upper()<<"]";
                    continue;
                }
            }//while i.hasnext

            /*
            while(i.hasNext()){
                annotationPtr p(i.next());
                qDebug()<<p->name<<
                          p->name2<<
                          p->txStart<<
                          p->txEnd<<
                          p->exonStarts;
            }
            //*/
            pi.first++;
        }//while end!=begin

        //update db
        QMap<int,QSet<annotationPtr> >::Iterator mit=result.upperBound(0);
        QString region;
        switch(mit.key()) {
            case 1:
                region="promoter";
                break;
            case 2:
                region="exon";
                break;
            case 3:
                region="intron";
                break;
            case 4:
                region="upstream";
                break;
        }

        QSetIterator<annotationPtr> i(mit.value());
        while(i.hasNext()){
            annotationPtr p(i.next());
            if(GENE_NAME.isEmpty()) {
                txStart=p->txStart;
                txEnd=p->txEnd;
                strand=p->strand;
            }
            if(!GENE_NAME.contains(p->name2))
                GENE_NAME<<p->name2;
            if(!REFSEQ_NAME.contains(p->name))
                REFSEQ_NAME<<p->name;
        }
        GENE_NAME.sort();
        REFSEQ_NAME.sort();
        QString gene_name,refseq_name;
        gene_name=GENE_NAME.value(0);
        refseq_name=REFSEQ_NAME.value(0);
        for(int i=1;i<GENE_NAME.count();i++){
            gene_name+=","+GENE_NAME.value(i);
            refseq_name+=","+REFSEQ_NAME.value(i);
        }
        QSqlQuery _q;
        _q.prepare("update `"+gSettings().getValue("experimentsdb")+"`.`"+tableName+"` "
                  "set refseq_id=?,gene_id=?,txStart=?,txEnd=?,strand=?,region='"+region+"' where chrom=? and start=? and end=?");
        _q.bindValue(0,refseq_name);
        _q.bindValue(1,gene_name);
        _q.bindValue(2,txStart);
        _q.bindValue(3,txEnd);
        _q.bindValue(4,strand);
        _q.bindValue(5,chr);
        _q.bindValue(6,start);
        _q.bindValue(7,end);
        if(!_q.exec()) {
            qDebug()<<"Query error info: "<<_q.lastError().text();
            throw "Error query to DB";
        }

    }
    emit finished();
}

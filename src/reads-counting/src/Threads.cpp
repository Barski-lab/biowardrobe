/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the ReadsCounting module of the genome-tools.
**
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Andrey Kartashov.
**
****************************************************************************/
#include <Threads.hpp>
#include <SamReader.hpp>
#include <Reads.hpp>


/*
 * Compare two segments if first within other
 * if first with other and left border equal
 * if first within other and right border equal
 *
 */
bool within(chrom_coverage::interval_type &x,chrom_coverage::interval_type &y){
    return x.lower()>=y.lower() && x.upper()<=y.upper();
}

bool within_equal(chrom_coverage::interval_type &x,chrom_coverage::interval_type &y){
    return x.lower()==y.lower() && x.upper()==y.upper();
}

bool within(quint64 x,chrom_coverage::interval_type &y){
    return x>=y.lower() && x<=y.upper();
}

bool within_lower_equal(chrom_coverage::interval_type &x,chrom_coverage::interval_type &y){
    return x.lower()==y.lower() && x.upper()<=y.upper();
}

bool within_upper_equal(chrom_coverage::interval_type &x,chrom_coverage::interval_type &y){
    return x.lower()>=y.lower() && x.upper()==y.upper();
}

//QString toString() {
//}

sam_reader_thread::sam_reader_thread(QString fn,gen_lines *sd,IsoformsOnChromosome* io):
    sam_data(sd),
    fileName(fn),
    isoforms(io)
{
    dUTP=(gArgs().getArgs("rna_seq").toString()=="dUTP");
    this->setAutoDelete(true);
}


//quint64 sam_reader_thread::getTotal(const QString &key,int &i,chrom_coverage::domain_type &l,chrom_coverage::domain_type &u)
//{
//    quint64 tot=0;
//    if(dUTP)
//    {
//        /*
//         * if it is dUTP method then only reads from opposite gene direction should be counted
//         */
//        if(isoforms[0][key][i]->strand==QChar('+'))
//        {
//            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(l,u);
//        }
//        else
//        {
//            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(l,u);
//        }
//    }
//    else
//    {
//        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(l,u);
//        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(l,u);
//    }
//    return tot;
//}

//void sam_reader_thread::correctBoundings(chrom_coverage::interval_type &itv,chrom_coverage::domain_type &l,chrom_coverage::domain_type &u)
//{
//    if(itv.bounds().bits() == bicl::interval_bounds::_left_open)
//    { l++; }
//    else if(itv.bounds().bits() == bicl::interval_bounds::_right_open)
//    { u--; }
//    else if(itv.bounds().bits() == bicl::interval_bounds::_open)
//    { l++; u--; }
//}


void sam_reader_thread::run(void)
{
    qDebug()<<fileName<<"- started";
    SamReader<gen_lines> (fileName,sam_data).Load();
    qDebug()<<fileName<<"- bam loaded";

    //    double bMu=(double)(sam_data->total-sam_data->notAligned)/(sam_data->tot_len*0.70);
    //bool arithmetic=(gArgs().getArgs("math_converging").toString()=="arithmetic");

    //    double cutoff=gArgs().getArgs("rpkm_cutoff").toDouble();
    //    double cut_val=gArgs().getArgs("rpkm_cutoff_val").toDouble();

    foreach(const QString key,isoforms[0].keys())/*Iterating trough chromosomes*/
        for(int i=0; i< isoforms[0][key].size();i++)/*Iterating trough isoforms on chromosomes*/ {
            if(isoforms[0][key][i]->testNeeded) continue; //already processed
            if(isoforms[0][key][i]->intersects) {
                for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
                {
                    isoforms[0][key][i]->intersects_isoforms->at(c)->testNeeded=true;
                }
                bool prnt=true;
                Math::Matrix<double> matrix(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
                //Math::Matrix<double> matrix_orig(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
                QVector<double> rowCol;
                rowCol.resize(isoforms[0][key][i]->intersects_isoforms->size());
                QList<IsoformPtr> g_qip = isoforms[0][key][i]->intersects_isoforms.data()[0];

                //chrom_coverage::iterator it_count_begin = isoforms[0][key][i]->intersects_count->begin();
                //chrom_coverage::iterator it_count_end = isoforms[0][key][i]->intersects_count->end();
                //qint64 starts_from=bicl::key_value<chrom_coverage >(it_count_begin).lower();

                //qint64 ends_with=bicl::key_value<chrom_coverage >(isoforms[0][key][i]->intersects_count->rbegin()).upper()+1;

fill_matrix(matrix,g_qip,isoforms[0][key][i],QChar('+'));
fill_matrix(matrix,g_qip,isoforms[0][key][i],QChar('-'));

                //genome::Cover::iterator cover_iter = sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getLowerBound(starts_from);
                //genome::Cover::iterator cover_iter_e=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getEndIterator();

                //                qDebug()<<isoforms[0][key][i]->name;
                //                for (int z=0; z< isoforms[0][key][i]->intersects_isoforms->size(); z++)
                //                {
                //                    qDebug()<<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(z)->name<<" inter:"
                //                           <<bicl::intersects(isoforms[0][key][i]->intersects_isoforms->at(0)->isoform,
                //                                              isoforms[0][key][i]->intersects_isoforms->at(z)->isoform);

                //                    chrom_coverage::iterator it_b=isoforms[0][key][i]->intersects_isoforms->at(z)->isoform.begin();
                //                    chrom_coverage::iterator it_e=isoforms[0][key][i]->intersects_isoforms->at(z)->isoform.end();
                //                    while(it_b!=it_e) {
                //                        chrom_coverage::interval_type it_v  =
                //                                bicl::key_value<chrom_coverage >(it_b++);
                //                        qDebug()<<"["<<it_v.lower()<<":"<<it_v.upper()<<"]";
                //                    }
                //                }



                //                qDebug()<<"Starts,Ends:"<<starts_from<<","<<ends_with;
                //                chrom_coverage::iterator it_count1=it_count_begin;
                //                for(;it_count1 != it_count_end; it_count1++) { //isoform segments
                //                    chrom_coverage::interval_type itv  =
                //                            bicl::key_value<chrom_coverage >(it_count1);
                //                    qDebug()<<"ISO: ["<<itv.lower()<<":"<<itv.upper()<<"],size:"<<(*it_count1).second.size()<<" chr:"<<isoforms[0][key][i]->chrom
                //                           <<" o:"<<(*it_count1).second.at(0)->chrom;
                //                }


                if(prnt) {
                    qDebug()<<"Mat:";
                    qDebug()<<matrix.toString();
                }



            } else { //if intersects /*if not intersects*/

                chrom_coverage::iterator it = isoforms[0][key][i]->isoform.begin();
                quint64 tot=0;
                for(; it != isoforms[0][key][i]->isoform.end(); it++)
                {
                    chrom_coverage::interval_type itv  =
                            bicl::key_value<chrom_coverage >(it);
                    if(dUTP)
                    {
                        /*
                         * if it is dUTP method then only reads from opposite gene direction should be counted
                         */
                        if(isoforms[0][key][i]->strand==QChar('+'))
                        {
                            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(itv.lower(),itv.upper());
                        }
                        else
                        {
                            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(itv.lower(),itv.upper());
                        }
                    }
                    else
                    {
                        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(itv.lower(),itv.upper());
                        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(itv.lower(),itv.upper());
                    }
                }
                isoforms[0][key][i]->totReads=tot;
                isoforms[0][key][i]->RPKM=
                        ((double)(tot)/((double)(isoforms[0][key][i]->isoform.size())/1000.0))/((double)(sam_data->total-sam_data->notAligned)/1000000.0);

                //                /*Wich RPKM is meaningfull ?*/
                //                if(isoforms[0][key][i]->RPKM < cutoff)
                //                    isoforms[0][key][i]->RPKM=cut_val;
            }
        }
    qDebug()<<fileName<<"- finished";
}



//-----------------------------
void sam_reader_thread::fill_matrix(Math::Matrix<double>& matrix,QList<IsoformPtr>& g_qip,IsoformPtr i_ptr,QChar strand) {


    //Math::Matrix<double> matrix(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
    //Math::Matrix<double> matrix_orig(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
    //QList<IsoformPtr> g_qip = isoforms[0][key][i]->intersects_isoforms.data()[0];

    chrom_coverage::iterator it_count_begin = i_ptr->intersects_count->begin();
    chrom_coverage::iterator it_count_end = i_ptr->intersects_count->end();
    qint64 starts_from=bicl::key_value<chrom_coverage >(it_count_begin).lower();

    qint64 ends_with=bicl::key_value<chrom_coverage >(i_ptr->intersects_count->rbegin()).upper()+1;

    genome::Cover::iterator cover_iter = sam_data->getLineCover(i_ptr->chrom+strand).getLowerBound(starts_from);
    genome::Cover::iterator cover_iter_e=sam_data->getLineCover(i_ptr->chrom+strand).getEndIterator();


    for(;cover_iter!=cover_iter_e && cover_iter.key()<=ends_with; cover_iter++) { //go throught reads starts
        for(int cr=0; cr<cover_iter.value().size(); cr++) { //go through reads

            genome::read_representation rp = cover_iter.value()[cr].getInterval();//this read should be deligated for particular isoform
            double rp_level=cover_iter.value()[cr].getLevel();
            genome::read_representation::iterator rp_it_begin = rp.begin();

            chrom_coverage::iterator it_count=it_count_begin;
            quint64 column=0;


            for(;it_count != it_count_end; it_count++,column++) { //isoform segments

                chrom_coverage::interval_type itv  = bicl::key_value<chrom_coverage >(it_count);
                QList< IsoformPtr > qip = (*it_count).second;

                genome::read_representation::interval_type  rritv = bicl::key_value< genome::read_representation >(rp_it_begin);
                if(rp.iterative_size()==1 && within(rritv,itv)) {
                    for(int c=0;c<qip.size();c++) {
                        matrix.setElement(g_qip.indexOf(qip.at(c)),column,matrix.getElement(g_qip.indexOf(qip.at(c)),column)+rp_level/qip.size());
                    }
                    break;
                } else if (rp.iterative_size()==1 && within(rritv.lower(),itv) && itv.bounds().bits() != bicl::interval_bounds::_right_open) {
                    int old_size=qip.size();
                    it_count++; column++;
                    if(it_count==it_count_end) break;
                    itv=bicl::key_value<chrom_coverage >(it_count);
                    if(within(rritv.upper(),itv)) {
                        if(old_size > (*it_count).second.size()) {
                            qip=(*it_count).second;
                            for(int c=0;c<qip.size();c++) {
                                matrix.setElement(g_qip.indexOf(qip.at(c)),column,matrix.getElement(g_qip.indexOf(qip.at(c)),column)+rp_level/qip.size());
                            }
                        } else {
                            it_count--; column--;
                            for(int c=0;c<qip.size();c++) {
                                matrix.setElement(g_qip.indexOf(qip.at(c)),column,matrix.getElement(g_qip.indexOf(qip.at(c)),column)+rp_level/qip.size());
                            }
                        }
                    }
                    break;
                }//right open

                chrom_coverage::iterator old_index = it_count;
                int old_size=0;
                int old_column=column;
                if(rp.iterative_size() > 1) {
                    size_t its=rp.iterative_size();
                    //qDebug()<<" rp size:"<<its;
                    //qDebug()<<"B: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_size;

                    for(;rp_it_begin!=rp.end() && it_count!=it_count_end; ) {
                        rritv = bicl::key_value< genome::read_representation >(rp_it_begin);// read's current segemnt
                        qip = (*it_count).second; //current list of intersections
                        itv  = bicl::key_value<chrom_coverage >(it_count); //current isoform segment

                        if(old_size==0 && within_upper_equal(rritv,itv)) {
                            if(old_size==0 || (old_size>qip.size()) ) {
                                old_size  = qip.size();
                                old_index = it_count;
                                old_column= column;
                            }
                            //qDebug()<<"F1: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                            it_count++; column++;
                            rp_it_begin++;
                            its--;
                            continue;
                        }

                        if(old_size==0 && within(rritv.lower(),itv) && itv.bounds().bits() == bicl::interval_bounds::_right_open) {
                            if(old_size==0 || (old_size>qip.size()) ) {
                                old_size  = qip.size();
                                old_index = it_count;
                                old_column= column;
                            }
                            //qDebug()<<"F2: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                            it_count++; column++;
                            if(it_count==it_count_end) break;
                            itv=bicl::key_value<chrom_coverage >(it_count);
                            qip = (*it_count).second;

                            if( rritv.upper() != itv.upper() ) break;
                            //qDebug()<<"F3: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                            if(old_size==0 || (old_size>qip.size()) ) {
                                old_size  = qip.size();
                                old_index = it_count;
                                old_column= column;
                            }

                            it_count++;  column++;
                            rp_it_begin++;
                            its--;
                            continue;
                        }

                        if( its > 1 && its < rp.iterative_size()) {//middle

                            if(within_equal(rritv,itv)) {
                                if( old_size>qip.size() ) {
                                    old_size  = qip.size();
                                    old_index = it_count;
                                    old_column= column;
                                }
                                //qDebug()<<"S1: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                                it_count++;  column++;
                                rp_it_begin++;
                                its--;
                                continue;
                            }

                            if(rritv.lower()==itv.lower() && itv.bounds().bits() == bicl::interval_bounds::_right_open ) {
                                if( old_size>qip.size() ) {
                                    old_size  = qip.size();
                                    old_index = it_count;
                                    old_column= column;
                                }
                                //qDebug()<<"S2: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                                it_count++; column++;
                                if(it_count==it_count_end) break;
                                itv=bicl::key_value<chrom_coverage >(it_count);
                                qip = (*it_count).second;

                                if( rritv.upper() != itv.upper() ) break;
                                //qDebug()<<"S3: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                                if( old_size>qip.size() ) {
                                    old_size  = qip.size();
                                    old_index = it_count;
                                    old_column= column;
                                }

                                it_count++;  column++;
                                rp_it_begin++;
                                its--;
                                continue;
                            }

                        }

                        if( its == 1 ) {//end

                            if( within_lower_equal(rritv,itv) ) {
                                if(old_size>qip.size()) {
                                    old_size  = qip.size();
                                    old_index = it_count;
                                    old_column= column;
                                }
                                qip = (*old_index).second;
                                //qDebug()<<"F4: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                                for(int c=0;c<qip.size();c++) {
                                    matrix.setElement(g_qip.indexOf(qip.at(c)),old_column,matrix.getElement(g_qip.indexOf(qip.at(c)),old_column)+rp_level/qip.size());
                                }
                                break;
                            }

                            if( rritv.lower()==itv.lower() && itv.bounds().bits() == bicl::interval_bounds::_right_open) {
                                if(old_size>qip.size()) {
                                    old_size  = qip.size();
                                    old_index = it_count;
                                    old_column= column;
                                }
                                qip = (*old_index).second;
                                //qDebug()<<"F5: ["<<itv.lower()<<":"<<itv.upper()<<"]...["<<rritv.lower()<<":"<<rritv.upper()<<"]"<<" old_s:"<<old_column;
                                for(int c=0;c<qip.size();c++) {
                                    matrix.setElement(g_qip.indexOf(qip.at(c)),old_column,matrix.getElement(g_qip.indexOf(qip.at(c)),old_column)+rp_level/qip.size());
                                }
                                break;
                            }

                        }

                        it_count++; column++;
                    }
                }
                break;
            }//isoform segments
        }
    }

}
//-----------------------------








#if 0



//                sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getLowerBound(starts_from);

//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------

//for(quint64 column=0; it_count_begin != isoforms[0][key][i]->intersects_count->end(); it_count_begin++,column++)
//{
//    chrom_coverage::interval_type itv  =
//            bicl::key_value<chrom_coverage >(it_count_begin);

//    /*Calculating densities, going trought rows for matrix */
//    for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
//    {
//        isoforms[0][key][i]->intersects_isoforms->at(c)->testNeeded=true;

//        if(bicl::intersects(isoforms[0][key][i]->intersects_isoforms->at(c)->isoform,itv))
//        {

//            matrix.setElement(c,column,cur_density==0.0?matrix.getLimit():cur_density);
//            matrix_orig.setElement(c,column,cur_density);
//            rowCol[c]+=1.0;
//        }
//        else
//        {
//            matrix.setElement(c,column,0.0);
//            matrix_orig.setElement(c,column,0.0);
//        }
//    }
//}


//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------------------------------------

for(quint64 column=0; it_count_begin != isoforms[0][key][i]->intersects_count->end(); it_count_begin++,column++)
{
    chrom_coverage::interval_type itv  =
            bicl::key_value<chrom_coverage >(it_count_begin);
    quint64 tot=0;
    chrom_coverage::domain_type l=itv.lower(), u=itv.upper();

    /**/
    correctBoundings(itv,l,u);
    chrom_coverage::domain_type exon_len=u-l+1;

    tot=getTotal(key,i,l,u);

    /*Calculating densities, going trought rows for matrix */
    for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
    {
        isoforms[0][key][i]->intersects_isoforms->at(c)->testNeeded=true;

        if(bicl::intersects(isoforms[0][key][i]->intersects_isoforms->at(c)->isoform,itv))
        {
            /*DEBUG*/
            if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
            {
                qDebug()<<"strand"<<isoforms[0][key][i]->strand<<
                          "totlen:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()<<
                          " segment:["<<l<<":"<<u<<"] c:"<<c+1<<"(1) len:"<<exon_len<<" reads: "<<tot<<" density:"<<(double)tot/exon_len
                       <<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name
                      <<" name2:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name2;

            }
            /*DEBUG*/

            double cur_density=0;//((double)tot/exon_len)/it_count_begin->second;
            //if(exon_len<25 && (double)tot/exon_len < 0.5 && !next_is_close)
            //if(lambda<bMu || exon_len >= (ri-le+1)) lambda=bMu; /*if exon_len eq or greater then whole isoform length*/
            //double p_val=1;


            /* Should be changed in future, if exon length less then 2*read length
             * then just ignore that exon, otherwise
             */


            if(exon_len<20)
            {
                matrix.setElement(c,column,0.0);
            }
            else
                //                            if( ((exon_len<300) && tot<50 && (p_val=Math::Poisson_cdist<double>(tot,lambda*(double)exon_len))>0.01 )
                //                                    || ( exon_len>=300 && tot< 10) )
                //                            { /*trying to ignore not relevant data*/

                //                                matrix.setElement(c,column,matrix.getLimit());
                //                                //matrix.setElement(c,column,0.0);

                //                                if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
                //                                {
                //                                    qDebug()<<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name<<" lambda:"<<lambda <<" bLambda:"<<bMu
                //                                           <<" curReads:"<<tot<<" exonLen:"<<exon_len
                //                                          <<"totlen:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()
                //                                         <<" mu:"<<lambda*(double)exon_len
                //                                        <<" p_val"<<p_val<<" density:"<<(double)tot/exon_len;
                //                                }
                //                            }
                //                            else
            {
                matrix.setElement(c,column,cur_density==0.0?matrix.getLimit():cur_density);
            }
            matrix_orig.setElement(c,column,cur_density);
            rowCol[c]+=1.0;
        }
        else
        {
            matrix.setElement(c,column,0.0);
            matrix_orig.setElement(c,column,0.0);
            /*DEBUG*/
            if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
            {

                qDebug()<<"strand"<<isoforms[0][key][i]->strand<<
                          "totlen:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()<<
                          " segment:["<<l<<":"<<u<<"] c:"<<c+1<<"(0) len:"<<exon_len<<" reads: "<<tot<<" density: 0"
                       <<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name
                      <<" name2:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name2;

            }
            /*DEBUG*/
        }
    }
}

if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
{
    /*DEBUG*/
    qDebug()<<"Matrix Converging";
    qDebug()<<"rowCol"<<rowCol;
    qDebug()<<matrix.toString();
    /*DEBUG*/
}

qint64 cylc=matrix.convergeAverageMatrix(arithmetic,rowCol);

if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
{
    /*DEBUG*/
    qDebug()<<"Matrix After Converging:"<<cylc;
    qDebug()<<matrix.toString();
    /*DEBUG*/
}

/*it is cycle trought column*/
it_count_begin = isoforms[0][key][i]->intersects_count->begin();
for(quint64 column=0; it_count_begin != isoforms[0][key][i]->intersects_count->end(); it_count_begin++,column++)
{
    chrom_coverage::interval_type itv  =
            bicl::key_value<chrom_coverage >(it_count_begin);

    chrom_coverage::domain_type l=itv.lower(),u=itv.upper();
    correctBoundings(itv,l,u);

    for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
    {
        double val=matrix.getValue(c,column);
        if(val==0) val=matrix_orig.getValue(c,column);
        isoforms[0][key][i]->intersects_isoforms->at(c)->density+=val*(u-l+1);
    }
}

for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
{
    isoforms[0][key][i]->intersects_isoforms->at(c)->totReads=(int)isoforms[0][key][i]->intersects_isoforms->at(c)->density;
    isoforms[0][key][i]->intersects_isoforms->at(c)->density=1000.0*isoforms[0][key][i]->intersects_isoforms->at(c)->density/isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size();
    double pm=(double)(sam_data->total-sam_data->notAligned)/1000000.0;
    isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=
            isoforms[0][key][i]->intersects_isoforms->at(c)->density/pm;

    //                    /*Wich RPKM is meaningfull ?*/
    //                    if(isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM < cutoff)
    //                        isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=cut_val;

    if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->intersects_isoforms->at(c)->name2) )
    {
        qDebug()<<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name
               <<" name2:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name2
              << " density:"<<(double)isoforms[0][key][i]->intersects_isoforms->at(c)->density
              << " totReads:"<<(double)isoforms[0][key][i]->intersects_isoforms->at(c)->totReads
              << " size:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()<<
                 " pm:"<<(double)pm << " rpkm:"<<(double)isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM;
    }
}
}
#endif



















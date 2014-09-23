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

sam_reader_thread::sam_reader_thread(QString fn,gen_lines *sd,IsoformsOnChromosome* io,double tot):
    sam_data(sd),
    fileName(fn),
    isoforms(io),
    totIsoLen(tot)
{
    dUTP=(gArgs().getArgs("rna_seq").toString()=="dUTP");
    arithmetic=(gArgs().getArgs("math_converging").toString()=="arithmetic");
    this->setAutoDelete(true);
}

void sam_reader_thread::run(void)
{
    qDebug()<<fileName<<"- started";
    SamReader<gen_lines> (fileName,sam_data).Load();
    qDebug()<<fileName<<"- bam loaded";

    double average=(double)(sam_data->total-sam_data->notAligned)/(totIsoLen);

    qDebug()<<"Total isoforms length:"<<totIsoLen;

    double cutoff=gArgs().getArgs("rpkm_cutoff").toDouble();
    double cut_val=gArgs().getArgs("rpkm_cutoff_val").toDouble();

    foreach(const QString key,isoforms[0].keys())/*Iterating trough chromosomes*/
        for(int i=0; i< isoforms[0][key].size();i++)/*Iterating trough isoforms on chromosomes*/ {
            if(isoforms[0][key][i]->testNeeded) continue; //already processed
            if(isoforms[0][key][i]->intersects) {

                //bool prnt=true;
                Math::Matrix<double> matrix(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
                QVector<double> rowCol;
                rowCol.resize(isoforms[0][key][i]->intersects_isoforms->size());

                if(dUTP) {
                    /*
                     * if it is dUTP method then only reads from opposite gene direction should be counted
                     */
                    if(isoforms[0][key][i]->strand==QChar('+')) {
                        fill_matrix(matrix,isoforms[0][key][i],QChar('-'));
                    }
                    else {
                        fill_matrix(matrix,isoforms[0][key][i],QChar('+'));
                    }
                } else {
                    fill_matrix(matrix,isoforms[0][key][i],QChar('+'));
                    fill_matrix(matrix,isoforms[0][key][i],QChar('-'));
                }

                Math::Matrix<double> matrix_orig(matrix);

                chrom_coverage::iterator it_count_begin = isoforms[0][key][i]->intersects_count->begin();
                chrom_coverage::iterator it_count_end = isoforms[0][key][i]->intersects_count->end();
                chrom_coverage::iterator it_count = it_count_begin;

                for(; it_count != it_count_end; it_count++) {
                    chrom_coverage::interval_type itv = bicl::key_value<chrom_coverage >(it_count);
                    int column=distance(it_count_begin,it_count);
                    /*Calculating densities, going trought rows for matrix */
                    for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++) {
                        isoforms[0][key][i]->intersects_isoforms->at(c)->testNeeded=true;

                        if(bicl::intersects(isoforms[0][key][i]->intersects_isoforms->at(c)->isoform,itv) ) {
                            double cur_density=matrix.getElement(c,column)/size(itv);
                            double p_val=0.0;
                            bool miss=false;
#define min_exon_len 50
                            if( size(itv)<6) {
                                matrix.setElement(c,column,0.0);
                                miss=true;
                            } else if(size(itv)<36 && itv.bounds().bits() != bicl::interval_bounds::_closed
                                      && (p_val=Math::Poisson_cdist<double>(cur_density*size(itv),average*(double)size(itv))) > 0.01 )  {
                                matrix.setElement(c,column,0.0);
                                miss=true;
                            } else {
                                //                                if(size(itv)<=min_exon_len && p_val==0.0) {
                                //                                    p_val=Math::Poisson_cdist<double>(cur_density*size(itv),average*(double)size(itv));
                                //                                }
                                //                                if( size(itv)>min_exon_len || p_val<0.05 ) {
                                matrix.setElement(c,column,cur_density==0.0?matrix.getLimit()*1.0e-10/size(itv):cur_density);
                                //                                matrix.setElement(c,column,cur_density);
                                //                                }else {
                                //                                    matrix.setElement(c,column,matrix.getLimit()/size(itv));
                                //                                }
                                rowCol[c]+=1.0;
                            }
                            matrix_orig.setElement(c,column,cur_density);
                            /*DEBUG*/
                            if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
                            {
                                qDebug()<<"strand"<<isoforms[0][key][i]->strand<<" row: "<<c<<" col:"<<column <<" name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name
                                       <<" curReads:"<<cur_density*size(itv)<<" exonLen:"<<size(itv)<<" exon["<<itv.lower()<<":"<<itv.upper()<<"] "
                                      <<"totlen:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()
                                     <<" mu:"<<average*(double)size(itv)<<" lambda:"<<average
                                    <<" p_val"<<p_val<<" density:"<<cur_density <<" m:"<<miss;
                            }
                            /*DEBUG*/
                        } else {
                            matrix.setElement(c,column,0.0);
                            matrix_orig.setElement(c,column,0.0);
                            /*DEBUG*/
                            if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
                            {
                                qDebug()<<"strand"<<isoforms[0][key][i]->strand<<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name
                                       <<" curReads: 0 exonLen:"<<size(itv)
                                      <<"totlen:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size();

                            }
                            /*DEBUG*/
                        }
                    }
                }

                /*DEBUG*/
                if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
                {
                    qDebug()<<"Matrix Converging";
                    qDebug()<<"rowCol"<<rowCol;
                    qDebug()<<matrix.toString();
                }
                /*DEBUG*/

                qint64 cylc=matrix.convergeAverageMatrix(arithmetic,rowCol);

                /*DEBUG*/
                if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
                {
                    qDebug()<<"Matrix After Converging:"<<cylc;
                    qDebug()<<matrix.toString();
                }
                /*DEBUG*/

                /*it is cycle trought column*/
                it_count=it_count_begin;
                for(; it_count != it_count_end; it_count++) {
                    chrom_coverage::interval_type itv = bicl::key_value<chrom_coverage >(it_count);
                    int column=distance(it_count_begin,it_count);

                    for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++) {
                        double val=matrix.getValue(c,column);
                        //if(val==0) val=matrix_orig.getValue(c,column);
                        isoforms[0][key][i]->intersects_isoforms->at(c)->density+=val*size(itv);
                    }
                }

                for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++) {
                    isoforms[0][key][i]->intersects_isoforms->at(c)->totReads=(int)isoforms[0][key][i]->intersects_isoforms->at(c)->density;
                    double pm=0.0;
                    if(isoforms[0][key][i]->intersects_isoforms->at(c)->totReads>0) {
                        isoforms[0][key][i]->intersects_isoforms->at(c)->density=1000.0*isoforms[0][key][i]->intersects_isoforms->at(c)->density/isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size();
                        pm=(double)(sam_data->total-sam_data->notAligned)/1000000.0;
                        isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=
                                isoforms[0][key][i]->intersects_isoforms->at(c)->density/pm;
                        /*Which RPKM is meaningfull ?*/
                        if(isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM < cutoff) {
                            isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=cut_val;
                            //isoforms[0][key][i]->intersects_isoforms->at(c)->totReads=0;
                        }
                    } else {
                        isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=0;
                    }
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


                //--------------------------------------------------------------------------------------------------------------------
            } else { /*if not intersects*/
                chrom_coverage::iterator it = isoforms[0][key][i]->isoform.begin();
                quint64 tot=0;
                for(; it != isoforms[0][key][i]->isoform.end(); it++) {
                    chrom_coverage::interval_type itv  =
                            bicl::key_value<chrom_coverage >(it);
                    if(dUTP) {
                        /*
                         * if it is dUTP method then only reads from opposite gene direction should be counted
                         */
                        if(isoforms[0][key][i]->strand==QChar('+')) {
                            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(itv.lower(),itv.upper());
                        } else {
                            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(itv.lower(),itv.upper());
                        }
                    } else {
                        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(itv.lower(),itv.upper());
                        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(itv.lower(),itv.upper());
                    }
                }
                isoforms[0][key][i]->totReads=tot;
                isoforms[0][key][i]->RPKM=
                        ((double)(tot)/((double)(isoforms[0][key][i]->isoform.size())/1000.0))/((double)(sam_data->total-sam_data->notAligned)/1000000.0);
                /*Which RPKM is meaningfull ?*/
                if(isoforms[0][key][i]->RPKM < cutoff) {
                    isoforms[0][key][i]->RPKM=cut_val;
                    isoforms[0][key][i]->totReads=0;
                }

            }
        }//iterating through hromosomes
    qDebug()<<fileName<<"- finished";
}


//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------

void inline repeat_fill_matrix(Math::Matrix<double>& matrix,QList<int>& columns,QList< IsoformPtr >& l_qip,
                               QList<IsoformPtr>& g_qip,double rp_level)
{
    //bool print=false;
    int tot_col=columns.size();
    for(int c=0;c<l_qip.size();c++) {
        int idx=g_qip.indexOf(l_qip.at(c));//row

        for(int co=0;co<tot_col;co++) {
            matrix.setElement(idx,columns.at(co),matrix.getElement(idx,columns.at(co))+rp_level/(l_qip.size()*tot_col));

            //            if( (!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(l_qip.at(c)->name2)) || print ) {
            //                print=true;
            //                qDebug()<<"I: row:"<<idx<<" column:"<<columns.at(co)<<" val:"<<rp_level/(l_qip.size()*tot_col);
            //            }
        }
    }
}

QList< IsoformPtr >& collect_index(chrom_coverage::iterator it_count,bool reset=false) {
    static QList< IsoformPtr > l_qip;
    QList< IsoformPtr > qip = (*it_count).second;
    if(reset) {
        l_qip.clear();
        l_qip.append(qip);
        return l_qip;
    }

    for(int i=0;i<l_qip.size();i++)
        if(qip.indexOf(l_qip.at(i)) == -1) {
            l_qip.removeAt(i);
            i--;
        }
    return l_qip;
}
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------------------------------
void sam_reader_thread::fill_matrix(Math::Matrix<double>& matrix,IsoformPtr i_ptr,QChar strand) {

    QList<IsoformPtr> g_qip = i_ptr->intersects_isoforms.data()[0];

    chrom_coverage::iterator it_count_begin = i_ptr->intersects_count->begin();//isoform fragmentation
    chrom_coverage::iterator it_count_end = i_ptr->intersects_count->end();

    qint64 starts_from=bicl::key_value<chrom_coverage >(it_count_begin).lower();
    qint64 ends_with=bicl::key_value<chrom_coverage >(i_ptr->intersects_count->rbegin()).upper()+1;

    genome::Cover::iterator cover_iter = sam_data->getLineCover(i_ptr->chrom+strand).getLowerBound(starts_from);
    genome::Cover::iterator cover_iter_e=sam_data->getLineCover(i_ptr->chrom+strand).getEndIterator();


    for(;cover_iter!=cover_iter_e && cover_iter.key()<ends_with; cover_iter++) { //go throught read's starts position QMap<int,QList<Read> >
        for(int cr=0; cr<cover_iter.value().size(); cr++) { //go through reads at particular position


            double rp_level=cover_iter.value()[cr].getLevel();//number of reads that are the same
            genome::read_representation rp = cover_iter.value()[cr].getInterval();//this read should be deligated for particular isoform
            genome::read_representation::iterator rp_it_begin = rp.begin();//read segmentation
            genome::read_representation::iterator rp_it_end = rp.end();//read segmentation
            genome::read_representation::iterator rp_it=rp_it_begin;

            chrom_coverage::iterator it_count=it_count_begin;//current iterator through isoform
            //            /*DEBUG*/
            //            if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(i_ptr->name2) )
            //            {
            //                genome::read_representation::interval_type  rritv = bicl::key_value< genome::read_representation >(rp_it_begin);
            //                qDebug()<<" read ["<<rritv.lower()<<":"<<rritv.upper()<<" num of:"<<rp_level <<" rp.size:"<<rp.iterative_size();
            //            }
            //            /*DEBUG*/

            QList<int> columns;
            for(;it_count != it_count_end; it_count++) { //isoform segments

                chrom_coverage::interval_type itv  = bicl::key_value<chrom_coverage >(it_count);
                genome::read_representation::interval_type  rritv = bicl::key_value< genome::read_representation >(rp_it_begin);

                if(rp.iterative_size()==1) {
                    if(within(rritv,itv)) {
                        columns<<distance(it_count_begin,it_count);
                        repeat_fill_matrix(matrix,columns,collect_index(it_count,true),g_qip,rp_level);
                        break;
                    } else if (within(rritv.lower(),itv) && itv.bounds().bits() != bicl::interval_bounds::_closed) {
                        columns<<distance(it_count_begin,it_count);
                        collect_index(it_count,true);
                        it_count++;
                        while(itv.bounds().bits() != bicl::interval_bounds::_closed && it_count!=it_count_end) {
                            columns<<distance(it_count_begin,it_count);
                            collect_index(it_count,true);
                            itv=bicl::key_value<chrom_coverage >(it_count);
                            if(within(itv,rritv)) {
                                it_count++;
                                continue;
                            }
                            if(within(rritv.upper(),itv)) {
                                repeat_fill_matrix(matrix,columns,collect_index(it_count),g_qip,rp_level);
                                break;
                            }
                            it_count++;
                        }
                        break;
                    }//right open
                    continue;
                } else if(rp.iterative_size() > 1) {

                    for(;rp_it!=rp_it_end && it_count!=it_count_end; ) {//cycle through current reads segments

                        rritv = bicl::key_value< genome::read_representation >(rp_it);// read's current segemnt
                        itv  = bicl::key_value<chrom_coverage >(it_count); //current isoform segment

                        unsigned int its=distance(rp_it_begin,rp_it)+1;
                        if( its == 1) {//begin

                            if(within_upper_equal(rritv,itv)) {
                                columns<<distance(it_count_begin,it_count);
                                collect_index(it_count,true);
                                rp_it++;
                            }else if(within(rritv.lower(),itv) && itv.bounds().bits() != bicl::interval_bounds::_closed) {
                                columns<<distance(it_count_begin,it_count);
                                collect_index(it_count,true);

                                it_count++;
                                while(itv.bounds().bits() != bicl::interval_bounds::_closed && it_count!=it_count_end) {
                                    columns<<distance(it_count_begin,it_count);
                                    collect_index(it_count,true);
                                    itv=bicl::key_value<chrom_coverage >(it_count);
                                    if(within(itv,rritv)) {
                                        it_count++;
                                        continue;
                                    }
                                    if( rritv.upper() == itv.upper() ) {
                                        break;
                                    }
                                    it_count++;
                                }
                                if(it_count==it_count_end || itv.bounds().bits() == bicl::interval_bounds::_closed) break;

                                rp_it++;
                            }
                            it_count++;
                            continue;
                        }

                        if( its > 1 && its < rp.iterative_size() ) {//middle
                            if(within_equal(rritv,itv)) {
                                columns<<distance(it_count_begin,it_count);
                                collect_index(it_count);
                                rp_it++;
                            } else if(rritv.lower()==itv.lower() && itv.bounds().bits() != bicl::interval_bounds::_closed ) {
                                columns<<distance(it_count_begin,it_count);
                                collect_index(it_count);

                                it_count++;
                                while(itv.bounds().bits() != bicl::interval_bounds::_closed && it_count!=it_count_end) {
                                    itv=bicl::key_value<chrom_coverage >(it_count);
                                    if(within(itv,rritv)) {
                                        it_count++;
                                        continue;
                                    }
                                    if( rritv.upper() == itv.upper() ) {
                                        break;
                                    }
                                    it_count++;
                                }
                                if(it_count==it_count_end || itv.bounds().bits() == bicl::interval_bounds::_closed) break;
                                columns<<distance(it_count_begin,it_count);
                                collect_index(it_count,true);
                                rp_it++;
                            }
                            it_count++;
                            continue;
                        }

                        if( its == rp.iterative_size() ) {//end

                            if( within_lower_equal(rritv,itv) ) {
                                columns<<distance(it_count_begin,it_count);
                                repeat_fill_matrix(matrix,columns,collect_index(it_count),g_qip,rp_level);
                                break;
                            } else if( rritv.lower()==itv.lower() && itv.bounds().bits() != bicl::interval_bounds::_closed) {
                                columns<<distance(it_count_begin,it_count);
                                collect_index(it_count);

                                it_count++;
                                bool ok=false;
                                while(itv.bounds().bits() != bicl::interval_bounds::_closed && it_count!=it_count_end) {
                                    itv=bicl::key_value<chrom_coverage >(it_count);
                                    if(within(itv,rritv)) {
                                        it_count++;
                                        continue;
                                    }
                                    if( rritv.upper() <= itv.upper() ) {
                                        columns<<distance(it_count_begin,it_count);
                                        collect_index(it_count,true);
                                        repeat_fill_matrix(matrix,columns,collect_index(it_count),g_qip,rp_level);
                                        ok=true;
                                        break;
                                    }
                                    it_count++;
                                }
                                if(it_count==it_count_end || itv.bounds().bits() == bicl::interval_bounds::_closed || ok) break;
                                break;
                            }
                        }
                        it_count++;
                    }//cycle through current reads segments
                    break;
                } //if rp.iterative_size > 1
            }//isoform segments
        }
    }

}
//-----------------------------








#if 0


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



















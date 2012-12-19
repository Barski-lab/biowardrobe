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


sam_reader_thread::sam_reader_thread(QString fn,gen_lines *sd,IsoformsOnChromosome* io):
    sam_data(sd),
    fileName(fn),
    isoforms(io)
{
    dUTP=(gArgs().getArgs("rna_seq").toString()=="dUTP");
}


quint64 sam_reader_thread::getTotal(const QString &key,int &i,chrom_coverage::domain_type &l,chrom_coverage::domain_type &u)
{
    quint64 tot=0;
    if(dUTP)
    {
        /*
         * if it is dUTP method then only reads from opposite gene direction should be counted
         */
        if(isoforms[0][key][i]->strand==QChar('+'))
        {
            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(l,u);
        }
        else
        {
            tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(l,u);
        }
    }
    else
    {
        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(l,u);
        tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(l,u);
    }
    return tot;
}

void sam_reader_thread::correctBoundings(chrom_coverage::interval_type &itv,chrom_coverage::domain_type &l,chrom_coverage::domain_type &u)
{
    if(itv.bounds().bits() == bicl::interval_bounds::_left_open)
    { l++; }
    else if(itv.bounds().bits() == bicl::interval_bounds::_right_open)
    { u--; }
    else if(itv.bounds().bits() == bicl::interval_bounds::_open)
    { l++; u--; }
}


void sam_reader_thread::run(void)
{
    qDebug()<<fileName<<"- started";
    SamReader<gen_lines> (fileName,sam_data).Load();
    qDebug()<<fileName<<"- bam loaded";

    double bMu=(double)(sam_data->total-sam_data->notAligned)/(sam_data->tot_len*0.70);
    bool arithmetic=(gArgs().getArgs("math_converging").toString()=="arithmetic");

    double cutoff=gArgs().getArgs("rpkm_cutoff").toDouble();
    double cut_val=gArgs().getArgs("rpkm_cutoff_val").toDouble();

    foreach(const QString key,isoforms[0].keys())/*Iterating trough chromosomes*/
        for(int i=0; i< isoforms[0][key].size();i++)/*Iterating trough isoforms on chromosomes*/
        {
            if(isoforms[0][key][i]->testNeeded) continue;
            if(isoforms[0][key][i]->intersects)
            {

                Math::Matrix<double> matrix(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
                Math::Matrix<double> matrix_orig(isoforms[0][key][i]->intersects_isoforms->size(),isoforms[0][key][i]->intersects_count->iterative_size());
                QVector<double> rowCol;
                rowCol.resize(isoforms[0][key][i]->intersects_isoforms->size());

                /*
                 * Counting total reads
                 */
                //chrom_coverage::domain_type le=isoforms[0][key][i]->txStart-50000,ri=isoforms[0][key][i]->txEnd+50000;
                //quint64 totReads=getTotal(key,i,le,ri);
                double lambda=bMu;//(double)totReads/(ri-le+1);

                /*
                 * it is cycle trought column
                 */
                chrom_coverage::iterator it_count = isoforms[0][key][i]->intersects_count->begin();
                for(quint64 column=0; it_count != isoforms[0][key][i]->intersects_count->end(); it_count++,column++)
                {
                    chrom_coverage::interval_type itv  =
                            bicl::key_value<chrom_coverage >(it_count);
                    quint64 tot=0;

                    /**/
                    chrom_coverage::domain_type l=itv.lower(), u=itv.upper();
                    correctBoundings(itv,l,u);
                    chrom_coverage::domain_type exon_len=u-l+1;

                    /*
                     * Testing if next fragment prolongs current
                     */
                    /*
                    bool next_is_close=false;
                    if(isoforms[0][key][i]->strand==QChar('+') && it_count!=isoforms[0][key][i]->intersects_count->end())
                    {
                        it_count++;
                        if(it_count!=isoforms[0][key][i]->intersects_count->end())
                        {
                            chrom_coverage::interval_type itv1  =
                                    bicl::key_value<chrom_coverage >(it_count);
                            if(u+1 >= itv1.lower())
                                next_is_close=true & (column>0);
                        }
                        it_count--;
                    }
                    */

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

                            double cur_density=((double)tot/exon_len)/it_count->second;
                            //if(exon_len<25 && (double)tot/exon_len < 0.5 && !next_is_close)
                            //if(lambda<bMu || exon_len >= (ri-le+1)) lambda=bMu; /*if exon_len eq or greater then whole isoform length*/
                            double p_val=1;


                            /* Should be changed in future, if exon length less then 2*read length
                             * then just ignore that exon, otherwise
                             */



                            if(exon_len<200 && (p_val=Math::Poisson_cdist<double>(tot,lambda*(double)exon_len))>0.01 )
                            { /*trying to ignore not relevant data*/



                                matrix.setElement(c,column,0.0);

                                if(!gArgs().getArgs("debug_gene").toString().isEmpty() && gArgs().getArgs("debug_gene").toString().contains(isoforms[0][key][i]->name2) )
                                {
                                    qDebug()<<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name<<" lambda:"<<lambda <<" bLambda:"<<bMu
                                           <<" curReads:"<<tot<<" exonLen:"<<exon_len
                                          <<"totlen:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()
                                         <<" mu:"<<lambda*(double)exon_len
                                        <<" p_val"<<p_val<<" density:"<<(double)tot/exon_len;
                                }
                            }
                            else
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
                it_count = isoforms[0][key][i]->intersects_count->begin();
                for(quint64 column=0; it_count != isoforms[0][key][i]->intersects_count->end(); it_count++,column++)
                {
                    chrom_coverage::interval_type itv  =
                            bicl::key_value<chrom_coverage >(it_count);

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

                    /*Wich RPKM is meaningfull ?*/
                    if(isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM < cutoff)
                        isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=cut_val;

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
            /*if not intersects*/
            else
            {
                chrom_coverage::iterator it = isoforms[0][key][i]->isoform.begin();
                quint64 tot=0;
                for(; it != isoforms[0][key][i]->isoform.end(); it++)
                {
                    chrom_coverage::interval_type itv  =
                            bicl::key_value<chrom_coverage >(it);

                    tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(itv.lower(),itv.upper());
                    tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(itv.lower(),itv.upper());
                }
                isoforms[0][key][i]->totReads=tot;
                isoforms[0][key][i]->RPKM=
                        ((double)(tot)/((double)(isoforms[0][key][i]->isoform.size())/1000.0))/((double)(sam_data->total-sam_data->notAligned)/1000000.0);

                /*Wich RPKM is meaningfull ?*/
                if(isoforms[0][key][i]->RPKM < cutoff)
                    isoforms[0][key][i]->RPKM=cut_val;
            }
        }
    qDebug()<<fileName<<"- finished";
    QTimer::singleShot(10, this, SLOT(quit()));
    this->exec();
}

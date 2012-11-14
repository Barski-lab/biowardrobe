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


void sam_reader_thread::run(void)
{
    qDebug()<<fileName<<"- started";
    SamReader<gen_lines> (fileName,sam_data).Load();
    qDebug()<<fileName<<"- bam loaded";

    foreach(const QString key,isoforms[0].keys())/*Iterating trough chromosomes*/
        for(int i=0; i< isoforms[0][key].size();i++)/*Iterating trough isoforms on chromosomes*/
        {
            if(!isoforms[0][key][i]->general.isNull()) continue;

            if(isoforms[0][key][i]->intersects)
            {
                QSharedPointer<chrom_coverage> p=QSharedPointer<chrom_coverage>(new chrom_coverage(isoforms[0][key][i]->intersects_count.data()[0]));
                for(int cc=0;cc<isoforms[0][key][i]->intersects_isoforms->size();cc++)
                    isoforms[0][key][i]->intersects_isoforms->at(cc)->general=p;

                chrom_coverage::iterator it_count = isoforms[0][key][i]->intersects_count->begin();
                chrom_coverage::iterator it = isoforms[0][key][i]->general->begin();

                for(; it != isoforms[0][key][i]->general->end(); it++,it_count++)
                {
                    chrom_coverage::interval_type itv  =
                            bicl::key_value<chrom_coverage >(it);
                    quint64 tot=1;

                    /**/


                    chrom_coverage::domain_type l=itv.lower();
                    chrom_coverage::domain_type u=itv.upper();

                    if(itv.bounds().bits() == bicl::interval_bounds::_left_open)
                    {
                        l++;
                    }
                    else if(itv.bounds().bits() == bicl::interval_bounds::_right_open)
                    {
                        u--;
                    }
                    else if(itv.bounds().bits() == bicl::interval_bounds::_open)
                    {
                        l++;
                        u--;
                    }
                    tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('+')).getStarts(l,u);
                    tot+=sam_data->getLineCover(isoforms[0][key][i]->chrom+QChar('-')).getStarts(l,u);
                    it->second=tot;


                    /*Calculating densities */
                    for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
                    {
                        if(bicl::intersects(isoforms[0][key][i]->intersects_isoforms->at(c)->isoform,itv))
                        {
                            isoforms[0][key][i]->intersects_isoforms->at(c)->totReads+=(tot-1);
                            if(isoforms[0][key][i]->intersects_isoforms->at(c)->min>it_count->second)
                            {
                                isoforms[0][key][i]->intersects_isoforms->at(c)->min=it_count->second;
                                isoforms[0][key][i]->intersects_isoforms->at(c)->count=1;
                                isoforms[0][key][i]->intersects_isoforms->at(c)->density=((float)tot/(u-l+1))/it_count->second;
                            }
                            if(isoforms[0][key][i]->intersects_isoforms->at(c)->min==it_count->second)
                            {
                                isoforms[0][key][i]->intersects_isoforms->at(c)->count++;
                                isoforms[0][key][i]->intersects_isoforms->at(c)->density+=((float)tot/(u-l+1))/it_count->second;
                            }
                        }
                    }
                }
                /*calculate total density*/
                float tot_density=0.0;
                for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
                {
                    isoforms[0][key][i]->intersects_isoforms->at(c)->density/=isoforms[0][key][i]->intersects_isoforms->at(c)->count;
                    tot_density+=isoforms[0][key][i]->intersects_isoforms->at(c)->density;
                }
                if(tot_density<0.000000001) tot_density=1.0;

                for(int c=0;c<isoforms[0][key][i]->intersects_isoforms->size();c++)
                {
//                    chrom_coverage reads=isoforms[0][key][i]->intersects_isoforms->at(c)->general.data()[0]         &isoforms[0][key][i]->intersects_isoforms->at(c)->isoform;
//                    chrom_coverage ratio=isoforms[0][key][i]->intersects_isoforms->at(c)->intersects_count.data()[0]&isoforms[0][key][i]->intersects_isoforms->at(c)->isoform;

//                    isoforms[0][key][i]->intersects_isoforms->at(c)->totReads;
//                            isoforms[0][key][i]->intersects_isoforms->at(c)->totReads*isoforms[0][key][i]->intersects_isoforms->at(c)->density/tot_density;
                float pk=(float)isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()/1000.0;
                float pm=(float)(sam_data->total-sam_data->notAligned)/1000000.0;
                    isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=
                            (isoforms[0][key][i]->intersects_isoforms->at(c)->totReads*isoforms[0][key][i]->intersects_isoforms->at(c)->density/tot_density)/(pk*pm);
                            //((float)(val)/((float)(reads.size())/1000.0))/((float)(sam_data->total-sam_data->notAligned)/1000000.0);

                    if(isoforms[0][key][i]->intersects_isoforms->at(c)->name2.startsWith("RPS3"))
                    {
                        //<<" size:"<<reads.size()
                        qDebug()<<"name:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name<<
                                  " name2:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->name2 <<" tot_density:" << tot_density << " min:"<<
                                  isoforms[0][key][i]->intersects_isoforms->at(c)->min << " density:"<<
                                  isoforms[0][key][i]->intersects_isoforms->at(c)->density << " size:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->isoform.size()<<
                                  " pk:"<<pk<<" pm:"<<pm << " rpkm:"<<isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM;

                    }

//                    if(reads.size()!=ratio.size())
//                    {
//                        qDebug()<<"Shit happend:"<<reads.size()<<" :"<<ratio.size();
//                    }
//                    else
                    {

//                        chrom_coverage::iterator itr = reads.begin();
//                        chrom_coverage::iterator rat = ratio.begin();
//                        float val=0;
//                        while(itr!=reads.end())
//                        {
//                            chrom_coverage::interval_type itvr  =
//                                    bicl::key_value<chrom_coverage >(itr);
//                            chrom_coverage::interval_type vrat  =
//                                    bicl::key_value<chrom_coverage >(rat);
//                            if(isoforms[0][key][i]->intersects_isoforms->at(c)->name2.startsWith("RPS3"))
//                            {
//                                qDebug()<<" ["<<itvr.lower()<<":" <<itvr.upper()<<"],["<<vrat.lower()<<":" <<vrat.upper()<<"] ="<<itvr.lower()-itvr.upper();
//                                qDebug()<<" reads val:"<<itr->second-1<<" ratio val:" <<rat->second-1 <<" ratio:"<<(float)(itr->second-1)/(rat->second-1);
//                            }
//                            if((float)(itr->second-1)/(rat->second-1)<0)
//                            {
//                                qDebug()<<" reads val:"<<itr->second<<" ratio val:" <<rat->second <<" minus one:" << ((float)itr->second-1.0);
//                            }
//                            val+=(float)(itr->second-1)/(rat->second-1);
//                            itr++;
//                            rat++;
//                        }
//                        /*Intersections should be analized and recalculated value of RPKM stored*/
//                        isoforms[0][key][i]->intersects_isoforms->at(c)->totReads=;
//                        isoforms[0][key][i]->intersects_isoforms->at(c)->RPKM=
//                                ((float)(val)/((float)(reads.size())/1000.0))/((float)(sam_data->total-sam_data->notAligned)/1000000.0);
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
                        ((float)(tot)/((float)(isoforms[0][key][i]->isoform.size())/1000.0))/((float)(sam_data->total-sam_data->notAligned)/1000000.0);
            }
        }
    qDebug()<<fileName<<"- finished";
    QTimer::singleShot(10, this, SLOT(quit()));
    this->exec();
}

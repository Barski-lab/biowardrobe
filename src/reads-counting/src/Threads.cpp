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

    foreach(const QString key,isoforms[0].keys())
    for(int i=0; i< isoforms[0][key].size();i++)
    {
//                bicl::interval_map<t_genome_coordinates,t_reads_count> tmp; 
        for(bicl::interval_map<t_genome_coordinates,t_reads_count>::iterator it = isoforms[0][key][i].data()->isoform.begin(); it != isoforms[0][key][i].data()->isoform.end(); it++)
        {
            bicl::discrete_interval<t_genome_coordinates> itv  = (*it).first;                                                                                                 \
            quint64 tot=0;
            tot+=sam_data->getLineCover(isoforms[0][key][i].data()->chrom+QChar('+')).getStarts(itv.lower(),itv.upper());
            tot+=sam_data->getLineCover(isoforms[0][key][i].data()->chrom+QChar('-')).getStarts(itv.lower(),itv.upper());

            (*it).second=tot;
            ((*isoforms)[key])[i].data()->totReads+=tot;
            if(tot==0 && isoforms[0][key][i].data()->totReads !=0 )
            {
                if(!((*isoforms)[key])[i].data()->testNeeded) qDebug()<<"key:"<<((*isoforms)[key])[i].data()->name2<<" test needed";
                ((*isoforms)[key])[i].data()->testNeeded=true;
            }
        }
                
        //for(int i=0; i<(*isoforms)[key].exCount;i++)
        //{
        //    quint64 tot=0;
        //    tot+=sam_data->getLineCover((*isoforms)[key].chrom+QChar('+')).getStarts((*isoforms)[key].exStarts.at(i),(*isoforms)[key].exEnds.at(i));
        //    tot+=sam_data->getLineCover((*isoforms)[key].chrom+QChar('-')).getStarts((*isoforms)[key].exStarts.at(i),(*isoforms)[key].exEnds.at(i));
        //    (*isoforms)[key].eachCount.append(tot);
        //    (*isoforms)[key].totReads+=tot;
        //}
//        if(!(*isoforms)[key].testNeeded)
        {
            ((*isoforms)[key])[i].data()->RPKM=((float)((*isoforms)[key])[i].data()->totReads/((float)((*isoforms)[key])[i].data()->len/1000.0))/((float)(sam_data->total-sam_data->notAligned)/1000000.0);
        }
    }
    qDebug()<<fileName<<"- finished";
    QTimer::singleShot(10, this, SLOT(quit()));
    this->exec();
}

/****************************************************************************
**
** Copyright (C) 2011 Andrey Kartashov .
** All rights reserved.
** Contact: Andrey Kartashov (porter@porter.st)
**
** This file is part of the global module of the genome-tools.
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
//GLOBALCALL{
// Arguments::addArg("sam_siteshift","sam_siteshift","SAM/SITESHIFT",QVariant::Int,"default siteshift",0);
// Arguments::addArg("sam_twicechr","sam_twicechr","SAM/TWICECHR",QVariant::String,"Which chromosome to double",QString(""));// chrX chrY
// Arguments::addArg("sam_ignorechr","sam_ignorechr","SAM/IGNORECHR",QVariant::String,"Which chromosome to ignore",QString(""));//chrM
// return 0;
//}();

/****************************************************************************************************************************
    desctructor, close bam files
****************************************************************************************************************************/
template <class Storage>
SamReader<Storage>::~SamReader()
{
#ifdef D_USE_BAM
    reader.Close();
#endif
}


/****************************************************************************************************************************

****************************************************************************************************************************/
template <class Storage>
SamReader<Storage>::SamReader( Storage* o, QObject *):
    output(o)
{
    inFile=gArgs().getArgs("in").toString();
    initialize();
}

/****************************************************************************************************************************

****************************************************************************************************************************/
template <class Storage>
SamReader<Storage>::SamReader(QString fn, Storage* o, QObject *):
    inFile(fn),
    output(o)
{
    initialize();
}

/****************************************************************************************************************************

****************************************************************************************************************************/
template <class Storage>
void SamReader<Storage>::initialize()
{

    QString twicechr=gArgs().getArgs("sam_twicechr").toString();
    QString ignorechr=gArgs().getArgs("sam_ignorechr").toString();

#ifdef D_USE_BAM
    vector<string> fn;
    fn.push_back(inFile.toStdString());
    if ( !reader.Open(fn) ) {
        qDebug() << "Could not open input BAM files.";
        throw "Could not open input BAM files";
    }

    header = reader.GetHeader();
    references = reader.GetReferenceData();

    for(int RefID=0;RefID < (int)references.size();RefID++)
    {

        if(ignorechr.contains(references[RefID].RefName.c_str()))
        {
            i_tids<<RefID;
            continue;
        }
        if(twicechr.contains(references[RefID].RefName.c_str()))
        {
            tids<<RefID;
        }
        //		qDebug() <<inFile<< " refname:" << references[RefID].RefName.c_str()<<"reflen:"<<references[RefID].RefLength;
        output->setLength(QChar('+'),references[RefID].RefName.c_str(),references[RefID].RefLength);
        output->setLength(QChar('-'),references[RefID].RefName.c_str(),references[RefID].RefLength);
        output->tot_len+=references[RefID].RefLength;
    }
#endif
    qDebug()<<inFile<<": Total genome length:"<<output->tot_len;// -hr.name, hr.len

}



/****************************************************************************************************************************

****************************************************************************************************************************/
template <class Storage>
void SamReader<Storage>::Load(void)
{
    int siteshift=gArgs().getArgs("sam_siteshift").toInt();
    int ignored=0,mapped=gArgs().getArgs("sam_mapped_limit").toInt();

#ifdef D_USE_BAM
    BamAlignment al;
    while ( reader.GetNextAlignment(al))
    {
        output->total++;

        if(al.IsMapped())
        {
            int num=1;
            if(i_tids.contains(al.RefID)) { ignored++; continue; }
            if(tids.contains(al.RefID)) { num=2; output->total++;}

            if(mapped==1) break;
            if(mapped>1)  mapped--;


            //char TagVal=0;
            //if(al.GetTag<char>("XS",TagVal) && ((al.IsReverseStrand() && TagVal=='-') || (!al.IsReverseStrand() && TagVal=='+')) )
            //{
            //    QString _out;
            //    const vector<CigarOp>& cigarData = al.CigarData;
            //    if (! cigarData.empty() )
            //    {
            //        vector<CigarOp>::const_iterator cigarIter = cigarData.begin();
            //        vector<CigarOp>::const_iterator cigarEnd  = cigarData.end();
            //        for ( ; cigarIter != cigarEnd; ++cigarIter ) {
            //            const CigarOp& op = (*cigarIter);
            //            _out+=QString("[Len=%1,Type=%2]").arg(op.Length).arg(op.Type);
            //        }
            //    }
            //    qDebug()<<"Name:"<<al.Name.c_str()<<"Seq:"<<al.QueryBases.c_str()<<" Position:["<<references[al.RefID].RefName.c_str()<<":"<<al.Position<<"-"<<al.GetEndPosition()<<"] XS:"<<TagVal
            //    <<"Len:"<<al.Length<<" Cigar"<<_out<<" strand:"<<(al.IsReverseStrand()?"-":"+");
            //}

            if(al.IsReverseStrand())
            {// - strand
                output->setGene(QChar('-'),
                                references[al.RefID].RefName.c_str(),
                                al.GetEndPosition()+1-siteshift,
                                num,al.Length
                                );
            }
            else
            {
                output->setGene(QChar('+'),
                                references[al.RefID].RefName.c_str(),
                                al.Position+1+siteshift,
                                num,al.Length
                                );
            }
        }
        else
        {
            output->notAligned++;
        }
    }

#endif

    qDebug()<<inFile<<": Total:"<<output->total;
    qDebug()<<inFile<<": Not aligned:"<<output->notAligned;
    qDebug()<<inFile<<": Aligned:"<<output->total-output->notAligned;
    qDebug()<<inFile<<": Ignored:"<<ignored;
    qDebug()<<inFile<<": Total aligned %:"<<((output->total-output->notAligned)*100/output->total);
}

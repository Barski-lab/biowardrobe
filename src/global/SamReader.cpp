
//GLOBALCALL{
// Arguments::addArg("sam_siteshift","sam_siteshift","SAM/SITESHIFT",QVariant::Int,"default siteshift",0);
// Arguments::addArg("sam_twicechr","sam_twicechr","SAM/TWICECHR",QVariant::String,"Which chromosome to double",QString(""));// chrX chrY
// Arguments::addArg("sam_ignorechr","sam_ignorechr","SAM/IGNORECHR",QVariant::String,"Which chromosome to ignore",QString(""));//chrM
// return 0;
//}();
//-------------------------------------------------------------
//-------------------------------------------------------------
template <class Storage>
SamReader<Storage>::~SamReader()
{
#ifdef D_USE_BAM
 reader.Close();
#endif
#ifdef D_USE_SAM
	samclose(fp);
#endif
}

//-------------------------------------------------------------
//-------------------------------------------------------------
//SamReader::SamReader( GenomeDescription *o, QObject *):
//output(o),
//out(0)
//{
// initialize();
//}

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
//			qDebug()<<inFile<<" Twiced chr!"<<references[RefID].RefName.c_str();
		}
//		qDebug() <<inFile<< " refname:" << references[RefID].RefName.c_str()<<"reflen:"<<references[RefID].RefLength;
        output->setLength(QChar('+'),references[RefID].RefName.c_str(),references[RefID].RefLength);
        output->setLength(QChar('-'),references[RefID].RefName.c_str(),references[RefID].RefLength);
		output->tot_len+=references[RefID].RefLength;
	}
#endif    	
#ifdef D_USE_SAM
	//SAM or actually BAM ?
	//  if(!setup.contains("SAM/RMODE"))
	//      setup.setValue("SAM/RMODE","r");
	//
	//  if(!setup.contains("SAM/SITESHIFT"))
	//      setup.setValue("SAM/SITESHIFT",0);
	//
	//  if(!setup.contains("SAM/TWICECHR"))
	//      setup.setValue("SAM/TWICECHR",QString("chrX chrY"));
	//
	//  if(!setup.contains("SAM/IGNORECHR"))
	//      setup.setValue("SAM/IGNORECHR",QString("chrM"));
	//
	//      
	//  if(inFile=="")
	//  {
	//   inFile=setup.value("inFileName").toString();
	//  }
	//
	if((fp = samopen(gArgs().getArgs("in").toString().toLocal8Bit().data(), 
		gArgs().getArgs("sam_rmode").toString().toLocal8Bit().data(), 0)) == 0) 
	{
		qCritical()<<"Fail to open file:" << inFile.toString().toLocal8Bit();
		qApp->quit();
	}
	qDebug()<<"filename:"<<inFile;

	bamCore=bam_init1();

	if(1)
	{
		//float tot_len=0.0;

		for(int i=0; i<fp->header->n_targets; i++)
		{
			if(ignorechr.contains(fp->header->target_name[i]))
			{
				i_tids<<i; 
				continue;
			}
			if(twicechr.contains(fp->header->target_name[i]))
			{
				tids<<i; 
				//qDebug()<<"Twiced chr!"<<i;
			}
			//  qDebug()<<fp->header->target_name[i]<<"="<<fp->header->target_len[i];// -hr.name, hr.len      
			//  tot_len+=fp->header->target_len[i];
			ii+=fp->header->target_len[i];
		}
		// qDebug()<<inFile<<": tot_len(float):"<<tot_len;// -hr.name, hr.len      
	}
#endif
	qDebug()<<inFile<<": Total genome length:"<<output->tot_len;// -hr.name, hr.len

} 
       


//-------------------------------------------------------------
//-------------------------------------------------------------

template <class Storage>
void SamReader<Storage>::Load(void)
{
	int siteshift=gArgs().getArgs("sam_siteshift").toInt();
	int ignored=0;
    QChar pos_str='+';
    QChar neg_str='-';
    if(gArgs().getArgs("rna_seq").toString()=="dUTP")
    {
        pos_str='-';
        neg_str='+';
        siteshift=-1*siteshift;
    }
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
				output->setGene(neg_str,
					references[al.RefID].RefName.c_str(),
					al.GetEndPosition()+1-siteshift,
					num,al.Length
					);
			}
			else
			{
				output->setGene(pos_str,
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
#ifdef D_USE_SAM
	while((samread(fp,bamCore))>0)
	{
		output->total++;

		if(bamCore->core.tid>=0)
		{
			int num=1;

			if(i_tids.contains(bamCore->core.tid)) { ignored++; continue; }
			if(tids.contains(bamCore->core.tid)) { num=2; output->total++;}

			//It is a question how to calculate the shift of nonsense strand 
			//start coordinate of align on nonsens strand is from left to right 
			//but expected the right position
			// (coordinate + sequnese length) = right position on non sense strand  
			//fp->header->target_len[bamCore->core.tid] - hr.len      
			//fp->header->target_name[bamCore->core.tid] - hr.name

			//qDebug()<<"data:"<<QString((const char*)bamCore->data);

			if(bam1_strand(bamCore)) 
			{// - strand
				output->setGene(neg_str,
					fp->header->target_name[bamCore->core.tid],
					bamCore->core.pos+bamCore->core.l_qseq+1-siteshift,
					num,bamCore->core.l_qseq
					);
			}
			else
			{ // + strand
				output->setGene(pos_str,
					fp->header->target_name[bamCore->core.tid],
					bamCore->core.pos+1+siteshift,
					num,bamCore->core.l_qseq
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
//-------------------------------------------------------------
//-------------------------------------------------------------
//template <class Storage>
//void SamReader<Storage>::onEntry(QEvent*)
//{
//	this->Load();
//}
//-------------------------------------------------------------
//-------------------------------------------------------------


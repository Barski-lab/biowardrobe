

#include "segmentcovering.hpp"




FSTM::FSTM(QObject *parent):
 QThread(parent)
 {
	 db=QSqlDatabase::database();
 }

FSTM::~FSTM()
 {
 }

/*
void FSTM::DB()
{

  if(!setup.contains("SQL/DRIVER"))
      setup.setValue("SQL/DRIVER","QMYSQL");
  if(!setup.contains("SQL/DBNAME"))
      setup.setValue("SQL/DBNAME","hg19");
  if(!setup.contains("SQL/HOST"))
      setup.setValue("SQL/HOST","10.200.42.25");
  if(!setup.contains("SQL/PORT"))
      setup.setValue("SQL/PORT",3306);
  if(!setup.contains("SQL/USER"))
      setup.setValue("SQL/USER","root");    
  if(!setup.contains("SQL/PASS"))
      setup.setValue("SQL/PASS",qCompress("").toBase64());
	
}
*/



#define QUERIES(a,b) \
  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_##b; \
  QMap<QString,bicl::interval_map<int,QList<QString> > > chr_intervals_map_##b; \
  \
  if(!q.exec(gArgs().getArgs(a).toString())) \
    { \
	  qWarning()<<qPrintable(tr("Select query error. ")+q.lastError().text()); \
    } \
  if(q.record().indexOf("exonStarts")>=0)  \
  {\
   if(q.record().count()==4) \
   { \
   while (q.next())  \
    {                \
     QStringList list1 = q.value(1).toString().split(",", QString::SkipEmptyParts); \
     QStringList list2 = q.value(2).toString().split(",", QString::SkipEmptyParts); \
     assert(list1.size()==list2.size()); \
     QList<QString> tmp; tmp+=q.value(3).toString();\
     for(int __i=0;__i<list2.size();__i++) \
      { \
       chr_intervals_map_##b [q.value(0).toString()].add(make_pair(bicl::discrete_interval<int>::closed(list1.at(__i).toInt(),list2.at(__i).toInt()),tmp)); \
      }\
    } \
   }/*if recourd count equal 4*/\
   else \
   { \
   while (q.next())  \
    {                \
     QStringList list1 = q.value(1).toString().split(",", QString::SkipEmptyParts); \
     QStringList list2 = q.value(2).toString().split(",", QString::SkipEmptyParts); \
     assert(list1.size()==list2.size()); \
     for(int __i=0;__i<list2.size();__i++) \
      { \
       chr_intervals_##b [q.value(0).toString()]+=bicl::discrete_interval<int>::closed(list1.at(__i).toInt(),list2.at(__i).toInt()); \
      }\
    } \
   } \
  }/*if record count has index*/ \
  else \
  {\
   if(q.record().count()==4) \
   { \
   while (q.next())  \
    {                \
     QList<QString> tmp; tmp+=q.value(3).toString();\
     chr_intervals_map_##b [q.value(0).toString()].add(make_pair(bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()),tmp)); \
    } \
   }\
   else \
   { \
   while (q.next())  \
     {                \
      if(!intersects(chr_intervals_##b [q.value(0).toString()],bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()))) \
      {\
       chr_intervals_##b [q.value(0).toString()]+=bicl::discrete_interval<int>::closed(q.value(1).toInt(),q.value(2).toInt()); \
       total_rows++; \
      }\
     } \
   }\
  }



//chr_intervals[chr]=chr_intervals_1[chr] - chr_intervals_2[chr];
#define UNIQUE_A_B(a,b,c) \
	bicl::separate_interval_set<int>::const_iterator __it1 = a.begin(); \
	bicl::separate_interval_set<int>::const_iterator __it2 = b.begin(); \
	\
	/*removing all intersection from first that exist in second*/ \
	bool _checking_=true; \
	while(__it1 != a.end() && __it2 != b.end()) \
	{ \
	bicl::discrete_interval<int> __itv1  = (*__it1); \
	bicl::discrete_interval<int> __itv2  = (*__it2); \
	\
	/*      qDebug()<<"itv1.l="<<__itv1.lower()<<" itv1.u="<<__itv1.upper();*/ \
	/*      qDebug()<<"itv2.l="<<__itv2.lower()<<" itv2.u="<<__itv2.upper();*/ \
	if(__itv1.upper()>__itv2.upper()) \
	{ \
	if(intersects(__itv1,__itv2)) _checking_=false; \
	__it2++; \
	/*      qDebug()<<"next --------------------------------------------"; */\
	} \
	  else \
	{ \
	/*      qDebug()<<"intersect"<<intersects(__itv1,__itv2);*/ \
	if(!intersects(__itv1,__itv2) && _checking_) \
	{ \
	c+=__itv1; \
	} \
	_checking_=true; \
	__it1++; \
	} \
	} 


#define INTERSECT_A_B(a,b,c) \
	bicl::separate_interval_set<int>::const_iterator __it1 = a.begin(); \
	bicl::separate_interval_set<int>::const_iterator __it2 = b.begin(); \
	\
	/*removing all intersection from first that exist in second*/ \
	while(__it1 != a.end() && __it2 != b.end()) \
	{ \
	bicl::discrete_interval<int> __itv1  = (*__it1); \
	bicl::discrete_interval<int> __itv2  = (*__it2); \
	\
	if(intersects(__itv1,__itv2)) \
	   { \
	   c+=__itv1; \
	   c+=__itv2; \
	   } \
	   \
	   if(__itv1.upper()>__itv2.upper()) \
	   { \
	   __it2++; \
	   } \
	  else \
	   { \
	   __it1++; \
	   } \
	} 

//QMap<QString,bicl::interval_map<int,QList<QString> > > percentile_result_##c; 
/*
        left=((left-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;               
        right=((right-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;             
        left=(left-__itv2.lower());               \
        right=(right-__itv2.lower());             \
        if(right>5000 || right>5000) \
        {                             \
      qDebug()<<"itv1.l="<<__itv1.lower()<<" itv1.u="<<__itv1.upper(); \
      qDebug()<<"itv2.l="<<__itv2.lower()<<" itv2.u="<<__itv2.upper(); \
      qDebug()<<"l="<<left<<" right="<<right; \
        }                               \
*/

#define INTERSECT_PERCENTILE_A_B(a,b,c) \
    bicl::separate_interval_set<int>::const_iterator __it1 = a.begin(); \
    bicl::separate_interval_set<int>::const_iterator __it2 = b.begin(); \
 \
    /*removing all intersection from first that exist in second*/ \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = (*__it1); \
      bicl::discrete_interval<int> __itv2  = (*__it2); \
 \
      if(intersects(__itv1,__itv2)) \
       { \
        int left=__itv1.lower();                                                                \
        int right=__itv1.upper();                                                               \
        if(left<__itv2.lower()) left=__itv2.lower();                                            \
        if(right>__itv2.upper()) right=__itv2.upper();                                           \
                                                                                                \
        left=((left-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;               \
        right=((right-__itv2.lower())/(double)(__itv2.upper()-__itv2.lower()))*100;             \
        c.add(make_pair(bicl::discrete_interval<int>::closed(left,right),1) ); \
       } \
\
      if(__itv1.upper()>__itv2.upper()) \
       { \
        __it2++; \
       } \
      else \
       { \
        __it1++; \
       } \
    } 

#define INTERSECT_W_MAP_A_B(a,b,c) \
    bicl::interval_map<int,QList<QString> >::const_iterator __it1 = a.begin(); \
    bicl::interval_map<int,QList<QString> >::const_iterator __it2 = b.begin(); \
\
    /*removing all intersection from first that exist in second*/ \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = __it1->first; \
      bicl::discrete_interval<int> __itv2  = __it2->first; \
\
      if(intersects(__itv1,__itv2)) \
       { \
         c.add(make_pair(__it2->first,__it1->second)); \
         c.add(make_pair(__it2->first,__it2->second)); \
       } \
\
      if(__itv1.upper()>__itv2.upper()) \
       { \
        __it2++; \
       } \
      else \
       { \
        __it1++; \
       } \
    } 


//This function looking for unique Segments in A, which are exist in A and have no intersections with segments in B
#define UNIQUE_W_MAP_A_B(a,b,c) \
    bicl::interval_map<int,QList<QString> >::const_iterator __it1 = a.begin(); \
    bicl::interval_map<int,QList<QString> >::const_iterator __it2 = b.begin(); \
 \
    /*removing all intersection from first that exist in second*/ \
    bool _checking_=true; \
    while(__it1 != a.end() && __it2 != b.end()) \
    { \
      bicl::discrete_interval<int> __itv1  = __it1->first; \
      bicl::discrete_interval<int> __itv2  = __it2->first; \
 \
      if(__itv1.upper()>__itv2.upper()) \
      { \
       if(intersects(__itv1,__itv2)) _checking_=false; \
       __it2++; \
      } \
      else \
      { \
       if(!intersects(__itv1,__itv2) && _checking_) \
        { \
         c.add(make_pair(__it1->first,__it1->second)); \
        } \
        _checking_=true; \
       __it1++; \
      } \
    } 


#define PRINT(a,b) \
   _outFile.setFileName(a); \
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
                                                             \
   foreach(chr,chr_intervals_##b.keys()) \
   {                                          \
                                               \
    for(bicl::separate_interval_set<int>::const_iterator it = chr_intervals_##b[chr].begin(); it != chr_intervals_##b[chr].end(); it++)\
     {                                                                                                                                                 \
      bicl::discrete_interval<int> itv  = (*it);                                                                                                 \
      \
      _outFile.write( QString("%1\t%2\t%3\n").                                                                                                     \
         arg(chr).arg(itv.lower()).arg(itv.upper()).toLocal8Bit() );                                                                  \
     }                                                                                                                                                 \
   }                                                                                                                                                   \
   _outFile.flush();                                                                                                                                   \
   _outFile.close();


#define PRINT1(a,b) \
   _outFile.setFileName(a); \
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
                                                             \
   foreach(chr,chr_intervals_map_##b.keys()) \
   {                                          \
                                               \
    for(bicl::interval_map<int,QList<QString> >::const_iterator it = chr_intervals_map_##b[chr].begin(); it != chr_intervals_map_##b[chr].end(); it++)\
     {                                                                                                                                                 \
      bicl::discrete_interval<int> itv  = it->first;                                                                                                 \
      QList<QString> tmp=it->second;                                                                                                                   \
      \
      QString _str=tmp.first(); \
      \
       for(int kk=1;kk<tmp.size();kk++) _str+=","+tmp.value(kk);                                                                                     \
      _outFile.write( QString("%1\t%2\t%3\t%4\n").                                                                                                     \
         arg(chr).arg(itv.lower()).arg(itv.upper()).arg(_str).toLocal8Bit() );                                                                  \
     }                                                                                                                                                 \
   }                                                                                                                                                   \
   _outFile.flush();                                                                                                                                   \
   _outFile.close();


#define PRINT_W_Q(a,b) \
   _outFile.setFileName(a); \
   _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); \
                                                             \
   foreach(chr,chr_intervals_map_##b.keys()) \
   {                                          \
    for(bicl::interval_map<int,QList<QString> >::const_iterator it = chr_intervals_map_##b[chr].begin(); it != chr_intervals_map_##b[chr].end(); it++)\
     {                                                                                                                                                 \
      bicl::discrete_interval<int> itv  = (*it).first;                                                                                                 \
      QList<QString> tmp=it->second;                                                                                                                   \
      QString _str,gene; \
      _str=tmp.first()+"\t";                                                                                                                             \
       for(int kk=1;kk<tmp.size() && kk<2;kk++) {_str+=tmp.value(kk)+QString("\t%1\t").arg(tmp.size()-1);gene=tmp.value(kk);}                            \
        if(!q.exec(QString(setup.value("QUERIES/Q_EXPRESSION").toString()).arg(gene).arg(gene))) \
         { \
              sqlErr = q.lastError(); \
	      qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); \
         } \
                   \
        while (q.next())  \
         {                \
             _str+=q.value(1).toString()+"\t"+q.value(2).toString()+"\t"+q.value(3).toString()+"\t"+q.value(4).toString()+"\t"; \
         } \
               \
         _outFile.write( QString("%1\t%2\t%3\t%4\n").                                                                                                     \
             arg(chr).arg(itv.lower()).arg(itv.upper()).arg(_str).toLocal8Bit() );                                                                  \
     }                                                                                                                                                 \
   }                                                                                                                                                   \
   _outFile.flush();                                                                                                                                   \
   _outFile.close();

/*       QString QUER="select 1,sample_1,sample_2,max(value_1),max(value_2) from expirements.TSS_NaiveCD4Rna_seqPRE where sample_1=0 and gene_id=\"%1\" group by sample_2 \
UNION ALL                                                                                                                                    \
select 2,sample_1,sample_2,max(value_1),max(value_2) from expirements.TSS_TEMCD4Rna_seqPRE where sample_1=0 and gene_id=\"%2\" group by sample_2";                   \*/


void FSTM::run()
 {  
	 QSqlQuery q("", db);

	 QMap<int,int> map;  
	 QFile _outFile;
	 double total_rows=0;

	 QMap<QString,bicl::separate_interval_set<int> > chr_intervals_0;//SQL
	 QMap<QString,bicl::separate_interval_set<int> > chr_intervals_00;//SQL
	 //  QMap<QString,bicl::interval_map<int,QList<QString> > > chr_intervals_map_0;//SQL
	 //  QMap<QString,bicl::interval_map<int,QList<QString> > > chr_intervals_map_00;//SQL


	 //  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_1;//SQL
	 //  QMap<QString,bicl::separate_interval_set<int> > chr_intervals_2;//SQL

	 QUERIES("sql_query1",1);//fill in chr_intervals
	 //  QUERIES("QUERIES/Q2",2);//fill in (in addition to Q1) chr_intervals format: [crhom]+=interval
	 qDebug()<<"query"<<gArgs().getArgs("sql_query1").toString();
	 qDebug()<<"total rows"<<q.size();
	 total_rows=0;
	 bicl::interval_map<int,int> percentile_result;

	 if(!q.exec(gArgs().getArgs("sql_query3").toString())) 
	 { 
		 sqlErr = q.lastError(); 
		 qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text()); 
	 } 
	 total_rows=q.size();
	 qDebug()<<"query"<<gArgs().getArgs("sql_query3").toString();
	 qDebug()<<"total rows"<<q.size();

//	 int tot_inter=0;

	 _outFile.setFileName(gArgs().getArgs("out").toString()+"heatmap.txt");
	 _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate); 
	 bool printed=false;

	 while (q.next())
	 { 
		 int resolution=q.value(4).toInt();
		 QBitArray _intersect(resolution);
		 int seg_l,seg_r;
		 if(q.value(3).toString()=="+")
		 {
			 seg_l=q.value(1).toInt()-resolution/2;
			 seg_r=q.value(1).toInt()+resolution/2;
		 }
		 else
		 {
			 seg_l=q.value(2).toInt()-resolution/2;
			 seg_r=q.value(2).toInt()+resolution/2;
		 }
		 bool inters=false;
		 //if current segment intersects with some segments from Q1
//		 if(intersects(chr_intervals_1 [q.value(0).toString()],bicl::discrete_interval<int>::closed(seg_l,seg_r)))
//		 {
//			 tot_inter++;
			 bicl::separate_interval_set<int> tmp; tmp+=bicl::discrete_interval<int>::closed(seg_l,seg_r);
			 tmp=chr_intervals_1[q.value(0).toString()] & tmp;

			 for(bicl::separate_interval_set<int>::const_iterator it = tmp.begin(); it != tmp.end(); it++)
			 {
				 inters=true;
				 int left=it->lower();
				 int right=it->upper();       
				 if(q.value(3).toString()=="+")
				 {
					 left=(left-seg_l);               
					 right=(right-seg_l);               
					 //        right=(right-q.value(1).toInt())/(double)(q.value(2).toInt()-q.value(1).toInt())*resolution;               
					 percentile_result.add(make_pair(bicl::discrete_interval<int>::closed(left,right),1) );        
					_intersect.fill(true,left,right);
				 }
				 else
				 {
					 //        left=( -1*(left-q.value(2).toInt())  )/(double)(q.value(2).toInt()-q.value(1).toInt())*resolution;               
					 //        right=( -1 *(right-q.value(2).toInt())  )/(double)(q.value(2).toInt()-q.value(1).toInt())*resolution;            
					 left=( -1*(left-seg_r ));
					 right=( -1 *(right-seg_r ));
					 percentile_result.add(make_pair(bicl::discrete_interval<int>::closed(right,left),1) );        
					_intersect.fill(true,right,left);
				 }
			 }//for by intersected segments 
			 QString _str="";
//			 bool _one=false;
			 if(q.value(5).toDouble() <2.0 && inters)
				 qDebug()<<q.value(6).toString();
			 if(q.value(5).toDouble() >=2.0 && q.value(5).toDouble()<5 && !printed)
			 {
				 for(int i=0; i<_intersect.size();i+=3)
				 {
					 _str+=QString("-1\t");
				 }
				 _str.chop(1); _str+="\n";
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _str="";
				 printed=true;
			 }
			 else if(q.value(5).toDouble()>5 && q.value(5).toDouble()<10 && printed)
			 {
				 printed=false;
			 }
			 else if(q.value(5).toDouble()>=10 && !printed)
			 {
				 for(int i=0; i<_intersect.size();i+=3)
				 {
					 _str+=QString("-1\t");
				 }
				 _str.chop(1); _str+="\n";
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _outFile.write(_str.toLocal8Bit());
				 _str="";
				 printed=true;
			 }

			 for(int i=0; i<_intersect.size();i+=3)
			 {
				 if(_intersect[i])
				 {
				  _str+=QString("1\t");
//				  _one=true;
				 }
				 else
				 {
				  _str+=QString("0\t");
				 }
			 }
			 //if(_one)
			 //{
			 _str.chop(1); _str+="\n";
			 _outFile.write(_str.toLocal8Bit());
/*			 }
			 else
			 {
				 qDebug()<<"All zeros"<<q.value(0).toString()<<"--"<<seg_l<<"--"<<seg_r;
			 }
		 }//if intersect 
*/
	 } 
	 _outFile.flush();
	 _outFile.close();
//	 qDebug()<<"total_intersects="<<tot_inter;    

	 /*
	 bicl::interval_map<int,int> percentile_result;
	 foreach(chr,chr_intervals_1.keys())
	 {
	 INTERSECT_PERCENTILE_A_B(chr_intervals_1[chr],chr_intervals_3[chr],percentile_result);
	 }
	 */
	 _outFile.setFileName(gArgs().getArgs("out").toString()+"percentile.txt");
	 _outFile.open(QIODevice::WriteOnly|QIODevice::Truncate);

	 for(bicl::interval_map<int,int>::const_iterator it = percentile_result.begin(); it != percentile_result.end(); it++)
	 {
		 bicl::discrete_interval<int> itv  = it->first;
		 double tmp=it->second/total_rows;
		 for(int i=itv.lower();i<itv.upper();i++)
			 _outFile.write( QString("%1\t%2\n").arg(i).arg(tmp).toLocal8Bit() );
	 }
	 _outFile.flush();
	 _outFile.close();

 }

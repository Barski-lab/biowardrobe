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
#include <Reads.hpp>


namespace genome {


Read & Read::operator= (const Read &r)
{
    this->multiplying=r.multiplying;
    this->length=r.length;
    this->position=r.position;
//    this->positions=r.positions;
    this->sentenceRepresentation=r.sentenceRepresentation;
    this->qualityRepresentation=r.qualityRepresentation;
    return *this;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void Cover::add(Read& r)
{
this->max_len=qMax<int>(this->max_len,r.getLength());

cover_map::iterator i = covering.find(r.getStart());

if(covering.end()!=i)
   i.value()++;
  else
    covering.insert(r.getStart(),r);
}
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void Cover::setLength(int l)
{
    this->length=l;
}
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
int Cover::getHeight(int s)
{
int start=s-max_len;
if(start<0) start=0;

return 0;
}
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
int Cover::getHeight(int,int)
{
return 0;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
/*int Cover::getStarts()
{
 static cover_map::iterator i = covering.begin();
 static count=0;
 count++;

 if(covering.end()==i) return -1;

 if(i.key()==count)
 return i.value().getLevel();
 return 0;
}
*/

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
QList<int> Cover::getStarts()
{
 return covering.keys();
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
int Cover::getStarts(int s)
{
 cover_map::iterator i = covering.find(s);

 if( covering.end()!=i && i.key()==s)
   return i.value().getLevel();

 return 0;
}
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
int  Cover::getStarts(int s,int e)
{
 int a=0;
 cover_map::iterator i = covering.lowerBound(s);

 for(;covering.end()!=i && i.key()<=e;i++)
       a+=i.value().getLevel();

 return a;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void Lines::addLine(QString str, Read &r)
{
// qDebug()<<"addlIne:"<<str<<" num:"<<r.getLevel();
 lines[str].add(r);
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void  Lines::setLength(quint64 l)
{
    length=l;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void  Lines::setLength(const QChar &sense,const QString &chrName, quint64 l)
{
    lines[chrName+sense].setLength(l);
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
Cover& Lines::getLineCover(QString s)
{
/* int a=0,d=0;

 QMap<QString,Cover>::iterator i = lines.begin();
 for(;i!=lines.end();i++){
  a+=i.value().covering.size();
  qDebug()<<i.key()<<" size:"<<i.value().covering.size();

    cover_map::iterator c = i.value().covering.begin();
    for(;c!=i.value().covering.end();c++){
        d+=c.value().getLevel();
        }
   }

 qDebug()<<"total A:" <<a;
 qDebug()<<"total D:" <<d;
*/
 if(lines.contains(s))
  return lines[s];

 return empty;//lines.begin().value();
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------


}//namespace


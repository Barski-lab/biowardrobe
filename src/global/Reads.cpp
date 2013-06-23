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


/************************************************************************************
 * Operator= for class Read, coping everything
************************************************************************************/
Read & Read::operator= (const Read &r)
{
    this->multiplying=r.multiplying;
    this->length=r.length;
    this->m_read_representation=r.m_read_representation;
    this->sentenceRepresentation=r.sentenceRepresentation;
    this->qualityRepresentation=r.qualityRepresentation;
    return *this;
}

/************************************************************************************
 *
************************************************************************************/
int&  Read::getLevel()
{
    return multiplying;
}

/************************************************************************************
 *
************************************************************************************/
int   Read::getStart()
{
    if(strand) {
        return bicl::key_value<read_representation>(m_read_representation.begin()).lower();
    } else {
        read_representation::iterator it=m_read_representation.end(); it--;
        return bicl::key_value<read_representation>(it).upper();
    }
}
/************************************************************************************
 *
************************************************************************************/
int   Read::getEnd()
{
    if(strand) {
        read_representation::iterator it=m_read_representation.end(); it--;
        return bicl::key_value<read_representation>(it).upper();
    } else {
        return bicl::key_value<read_representation>(m_read_representation.begin()).lower();
    }
}

/************************************************************************************
 *
************************************************************************************/
int&  Read::getLength()
{
    return length;
}

/************************************************************************************
 *
************************************************************************************/
read_representation& Read::getInterval()
{
    return m_read_representation;
}

/************************************************************************************
 *
************************************************************************************/
Read& Read::getMyself(void)
{
    return *this;
}

/************************************************************************************
 * Increase number of identical reads by c
************************************************************************************/
void  Read::operator+= (const int& c)
{
    this->multiplying+=c;
}

/************************************************************************************
 * Increase number of identical reads by 1
************************************************************************************/
void  Read::operator++ (int)
{
    *this+=1;
}

/************************************************************************************
 *
************************************************************************************/
bool  Read::operator== (const Read& r) const
{
    //    read_representation::const_iterator it = this->m_read_representation.begin();
    //    read_representation::const_iterator it_other = r.m_read_representation.begin();

    //    for(;it!=this->m_read_representation.end();it++,it_other++)
    //    {
    //        if(it_other==r.m_read_representation.end()) return false;
    //        read_representation::interval_type itv1  = bicl::key_value<read_representation>(it);
    //        read_representation::interval_type itv2  = bicl::key_value<read_representation>(it_other);
    //        if(itv1!=itv2) return false;
    //    }
    //    if(it_other!=r.m_read_representation.end()) return false;
    //    return true;
    return this->m_read_representation==r.m_read_representation;
}

/************************************************************************************
 *
************************************************************************************/
bool  Read::operator!= (const Read& r) const
{

    return !((*this)==r);
}


//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void Cover::addRead(Read& r)
{
    iterator i = covering.find(r.getStart());

    if(covering.end()!=i)
    {
        for (int j=0; j<i.value().size(); j++)
        {
            if(i.value().at(j)==r)
            {
                i.value()[j]++;
                return;
            }
        }
    }
    covering[r.getStart()]<<r;
}
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void Cover::setLength(qint64 l)
{
    this->length=l;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
qint64 Cover::getLength(void)
{
    return this->length;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
QList<int> Cover::getStarts()
{
    return covering.keys();
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
int  Cover::getStarts(int s,int e)
{
    int a=0;
    iterator i = getLowerBound(s);

    for(;covering.end()!=i && i.key()<=e;i++)
        countReads<int>(i.value(),a);
    return a;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
void Lines::addRead(QString str, Read &r)
{
    lines[str].addRead(r);
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
quint64  Lines::getLength(void)
{
    return length;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
quint64  Lines::getLength(const QChar &sense,const QString &chrName)
{
    return lines[chrName+sense].getLength();
}
//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
Cover& Lines::getLineCover(QString s)
{
    if(lines.contains(s))
        return lines[s];

    return empty;
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------
QList<QString> Lines::getLines(void)
{
    return lines.keys();
}

//-----------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------


//void GenomeDescription::setGene(const QChar &sense,const QString &chrName,const qint32 &pos,const qint32 & num,const qint32 &len)
//{
//    bool st=(sense==QChar('+'));
//    Read r(pos,len,num,st);
//    addRead(chrName+sense,r);
//}

void GenomeDescription::setGene(const QChar &sense,const QString &chrName,read_representation &r,const qint32 & num)
{
    bool st=(sense==QChar('+'));
    Read read(r,st,num);
    addRead(chrName+sense,read);
}


}//namespace


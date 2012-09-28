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


//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
template <class Storage>
SqlReader<Storage>::SqlReader(Storage *o,QString iqn,QString iqnns,QState *parent):
 QState(parent),
 output(o),
 iniQueryNameSense(iqn),
 iniQueryNameNSense(iqnns)
{
}

//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
template <class Storage>
void SqlReader<Storage>::onEntry(QEvent*)
{
  QSqlQuery q;

  if(!q.exec(setup.value(iniQueryNameSense).toString()))
    {
      sqlErr = q.lastError();
      qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text());
    }

  while (q.next()) 
    {
     output->setGene('+',q.value(0).toString(),q.value(1).toInt(),1, q.value(2).toInt()-q.value(1).toInt()+1 );
     output->total++;
    } 

  if(setup.contains(iniQueryNameNSense))
  {
   if(!q.exec(setup.value(iniQueryNameNSense).toString()))
     {
      sqlErr = q.lastError();
      qWarning()<<qPrintable(tr("Select query error. ")+sqlErr.text());	   
     }

   while (q.next()) 
     {
      output->setGene('-',q.value(0).toString(),q.value(1).toInt(),1,q.value(2).toInt()-q.value(1).toInt()+1);
      output->total++;
     }
  }
}
//---------------------------------------------------------------------------
//---------------------------------------------------------------------------
template <class Storage>
SqlReader<Storage>::~SqlReader()
{
}


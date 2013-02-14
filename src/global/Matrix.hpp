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
#ifndef _MATRIX_H_28112012_
#define _MATRIX_H_28112012_

namespace Math{

/*
 *
 */
template <class T>
class Matrix
{
public:
    typedef Matrix<T>   type;
    typedef T           domain_type;

    Matrix();
    Matrix(Matrix<T>&);
    Matrix(qint64,qint64);

    T&      getElement(qint64,qint64);
    void    setElement(qint64,qint64,T);

    T       getValue(qint64,qint64);
    qint64  getRowCount(void) const;

    qint64  getRowColCount(qint64,T);
    qint64  getColRowCount(qint64,T);

    void    setRowCount(qint64);

    qint64  getColCount(void) const;
    qint64  getColCount(T);
    void    setColCount(qint64);

    T       colSum(qint64 col);
    T       rowSum(qint64);
    T       rowLogSum(qint64);
    T       SumAll(bool abs=false);

    T& operator()(qint64, qint64);
    Matrix<T> &operator+= (const type &);
    Matrix<T> &operator-= (const type &);
    Matrix<T>  operator-  (const type &) const;
    Matrix<T>  operator+  (const type &) const;
    Matrix<T> &operator=  (const type &);

    QString toString(void);

    void    fillRowCond(qint64,T,T);
    void    fillColCond(qint64,T,T);

    qint64 convergeAverageMatrix(bool arithmetic, QVector<T> rowCol);
    T getLimit(void);
private:
    QVector<QVector<T> > m_matrix_data;
    void init(qint64,qint64);
};

/*
 *
 */
template <class T>
Matrix<T>::Matrix()
{
}

/*
 *
 */
template <class T>
Matrix<T>::Matrix(Matrix<T> &m)
{
    m_matrix_data=m.m_matrix_data;
}

/*
 *
 */
template <class T>
Matrix<T>::Matrix(qint64 row,qint64 col)
{
    init(row,col);
}

/*
 *
 */
template <class T>
void Matrix<T>::init(qint64 row,qint64 col)
{
    this->setRowCount(row);
    this->setColCount(col);
}

/*
 *
 */
template <class T>
T&      Matrix<T>::getElement(qint64 row,qint64 col)
{
    return m_matrix_data[row][col];
}

/*
 *
 */
template <class T>
void    Matrix<T>::setElement(qint64 row,qint64 col,T value)
{
    if(m_matrix_data.size()<row)
        this->setRowCount(row);
    if(m_matrix_data[row].size()<col)
        this->setColCount(col);
    m_matrix_data[row][col]=value;
}

/*
 *
 */
template <class T>
T      Matrix<T>::getValue(qint64 row,qint64 col)
{
    return m_matrix_data[row].at(col);
}

/*
 *
 */
template <class T>
qint64 Matrix<T>::getRowCount(void) const
{
    return m_matrix_data.size();
}

/*
 *
 */
template <class T>
qint64 Matrix<T>::getRowColCount(qint64 row,T cond)
{
    qint64 sum=0;
    for(int i=0;i<m_matrix_data[row].size();i++)
        if(m_matrix_data[row][i]!=cond)
            sum++;
    return sum;
}

/*
 *
 */
template <class T>
qint64 Matrix<T>::getColRowCount(qint64 col,T cond)
{
    qint64 sum=0;
    for(int i=0;i<m_matrix_data.size();i++)
        if(m_matrix_data[i][col]!=cond)
            sum++;
    return sum;
}

/*
 *
 */
template <class T>
void    Matrix<T>::setRowCount(qint64 row)
{
    m_matrix_data.resize(row);
}

/*
 *
 */
template <class T>
qint64 Matrix<T>::getColCount(void) const
{
    if(m_matrix_data.size()!=0)
        return m_matrix_data[0].size();
    return 0;
}

/*
 *
 */
template <class T>
void    Matrix<T>::setColCount(qint64 col)
{
    if(m_matrix_data.size()==0)
        this->setRowCount(1);

    for(int i=0;i<m_matrix_data.size();i++)
        m_matrix_data[i].resize(col);
}


/*
 * Sum up all elements in a column
 */
template <class T>
T    Matrix<T>::colSum(qint64 col)
{
    if(this->getRowCount()==0)
        return (T)0;

    if(this->getColCount()<col)
        return (T)0;

    T sum=(T)0;
    for(int i=0;i<this->getRowCount();i++)
        sum+=m_matrix_data[i][col];
    return sum;
}

/*
 * Sum up all elements in a row
 */
template <class T>
T    Matrix<T>::rowSum(qint64 row)
{
    if(this->getRowCount()<row)
        return (T)0;

    T sum=(T)0;
    for(int i=0;i<m_matrix_data[row].size();i++)
        sum+=m_matrix_data[row][i];
    return sum;
}

/*
 * Sum up all log of elements in a row
 */
template <class T>
T       Matrix<T>::rowLogSum(qint64 row)
{
    if(this->getRowCount()<row)
        return (T)0;

    T sum=(T)0;
    for(int i=0;i<m_matrix_data[row].size();i++)
        if(m_matrix_data[row][i]>(T)0)
            sum+=mlog<T>(m_matrix_data[row][i]);
    return sum;
}

/*
 * Sum up all elements in the matrix
 */
template <class T>
T    Matrix<T>::SumAll(bool abs)
{
    if(this->getRowCount()==0)
        return (T)0;

    T sum=(T)0;
    if(abs)
    {
        for(int i=0;i<this->getRowCount();i++)
            for(qint64 j=0;j<this->getColCount();j++)
                sum+=qAbs<T>((*this)(i,j));
    }
    else
    {
        for(int i=0;i<this->getRowCount();i++)
            for(qint64 j=0;j<this->getColCount();j++)
                sum+=(*this)(i,j);
    }
    return sum;
}

/*
 * Apply value (val) to all fields in a row (row)
 *  except those that are not equal cond
 */
template <class T>
void Matrix<T>::fillRowCond(qint64 row,T val,T cond)
{
    if(m_matrix_data.size()<row)
        return;
    for(qint64 i=0;i<m_matrix_data[row].size();i++)
        if(m_matrix_data[row][i]!=cond)
            m_matrix_data[row][i]=val;
}

/*
 * Apply value (val) to all fields in a column (col)
 *  except those that are not equal cond
 */
template <class T>
void Matrix<T>::fillColCond(qint64 col,T val,T cond)
{
    if(m_matrix_data.size()==0)
        return;
    if(m_matrix_data[0].size()<col)
        return;
    for(qint64 i=0;i<m_matrix_data.size();i++)
        if(m_matrix_data[i][col]!=cond)
            m_matrix_data[i][col]=val;
}

/*
 *
 */
template <class T>
T Matrix<T>::getLimit()
{
    //static T val=std::numeric_limits<T>::min()*1.0e+10;
    static T val=(T)(gArgs().getArgs("rpkm_cutoff").toDouble()*1.0e-6);
    return val;
}

/*
 * This function solving matrix using arithmetic mean
 *  Equations like this:
 *   densities in each column of particular row should be equal
 *   sum of densities in each column should be equal in sum of original matrix
 */
template <class T>
qint64 Matrix<T>::convergeAverageMatrix(bool arithmetic,QVector<T> rowCol)
{
    QVector<T> sumCol;
    double cutoff=getLimit()*1.0e4;
    double locLim=getLimit()/1.0e20;
    /*calculating original sums of each column*/

    for(qint64 i=0;i<this->getColCount();i++) {
        sumCol<<this->colSum(i);
    }

    Matrix<T> tmp(*this);

    qint64 cycles=0;
    for(;cycles<2000;cycles++)
    {
        /*cycle trough rows, make average of all rows, and assign*/
        if(arithmetic) {
            for(qint64 i=0; i<this->getRowCount(); i++) {
                T av=this->rowSum(i)/rowCol.at(i);
                this->fillRowCond(i,av,(T)0);
            }
        }
        else {
            for(qint64 i=0; i<this->getRowCount(); i++) {
                T av=this->rowLogSum(i)/rowCol.at(i);
                av=mexp<T>(av);
                if(av<locLim)
                    av=locLim;
                this->fillRowCond(i,av,(T)0);
            }
        }
        /*cycle trough column, sum of ratio of all columns should be original val */
        for(qint64 j=0; j<this->getColCount(); j++) {
            T sum=this->colSum(j);
            if(sum==0) continue;
            T rat=sumCol.at(j)/sum;
            for(qint64 r=0;r<this->getRowCount();r++) {
                if(this->getElement(r,j)==(T)0) continue;
                //T av = sumCol.at(j)*this->getElement(r,j)/sum;
                T av = rat*this->getElement(r,j);
                //if(av<locLim)
                //    av=locLim;
                this->setElement(r,j,av);
            }
        }

        tmp-=*this;

        if(tmp.SumAll(true)<cutoff)
            return cycles;

        tmp=*this;
    }

    return cycles;
}


#ifdef EM
#if 0
Matrix<T> tmp(*this);
T N_tot=tmp.SumAll();
QVector<T> Pk;
QVector<T> Pk_old;
T diff=1;
int cycles=0;

for(qint64 r=0; r<this->getRowCount(); r++) {
    Pk<<this->rowSum(r)/N_tot;
    Pk_old<<0;
}

while(diff>1.0e-6) {
    cycles++;
    diff=0.0;
    for(qint64 c=0; c<this->getColCount(); c++) {
        T column_sum=0.0;
        for(qint64 r=0;r<this->getRowCount();r++) {
            T el=tmp.getElement(r,c)*Pk[r];
            column_sum+=el;
            tmp.setElement(r,c,el);
        }
        if(column_sum==0) continue;
        for(qint64 r=0;r<this->getRowCount();r++) {
            T el=tmp.getElement(r,c)/column_sum;
            tmp.setElement(r,c,el);
        }
    }
    for(int i=0;i<Pk.size();i++)
        Pk_old[i]=Pk[i];
    //int N=this->getColCount();
    T N=0.0;
    for(int i=0; i<this->getRowCount(); i++) {
        T el=tmp.rowSum(i);
        //Pk[i]=el/iso_exons.at(i);
        N+=el;
        Pk[i]=el;
        //diff+=abs(Pk_old[i]-Pk[i]);
    }
    for(int i=0; i<Pk.size(); i++) {
        Pk[i]=Pk[i]/N;
        diff+=abs(Pk_old[i]-Pk[i]);
    }
}
        for(int r=0; r<this->getRowCount(); r++) {
                this->setElement(r,0,N_tot*Pk[r]);
        }
//    for(int c=0; c<this->getColCount(); c++) {
//        T sum=this->colSum(c);
//        for(int r=0; r<this->getRowCount(); r++) {
//            if(this->getElement(r,c)!=0)
//                this->setElement(r,c,sum*Pk[r]);
//        }
//    }

#endif
#endif


#if 0



#endif

/*
 * Make a printable string
 */
template <class T>
QString    Matrix<T>::toString(void)
{
    if(this->getRowCount()==0)
        return QString("Empty matrix.");
    if(this->getColCount()==0)
        return QString("Empty matrix.");

    QString str=QString("\nMatrix[%1,%2]\n t(matrix(c(\n").arg(this->getRowCount()).arg(this->getColCount());
    for(int i=0;i<this->getRowCount();i++)
    {
        for(qint64 j=0;j<this->getColCount();j++)
        {
            str+=QString("%1,\t").arg(this->getValue(i,j),0,'e',5);//arg(d, 0, 'E', 3)
        }
        str.chop(1);
        str+="\n";
    }
    str.chop(2);
    str+=QString("\n),ncol=%1))\n").arg(this->getRowCount());
    return str;
}

/********************************************************************************************
 *
 *                     OPERATORS
 *
 ********************************************************************************************/
/*
 * Sum of Matrices A=A+B
 */
template <class T>
Matrix<T>& Matrix<T>::operator+=(const type &m)
{
    qint64 rc=this->getRowCount();
    qint64 cc=this->getColCount();

    assert(rc==m.getRowCount() && cc==m.getColCount());
    for(qint64 i=0; i<rc; i++)
        for(qint64 j=0;j<cc;j++)
            this->m_matrix_data[i][j]+=m.m_matrix_data[i][j];
    return *this;
}

/*
 *  A=B
 */
template <class T>
Matrix<T>& Matrix<T>::operator=(const type &m)
{
    this->m_matrix_data=m.m_matrix_data;
    return *this;
}


/*
 * Sum of Matrices C=A+B
 */
template <class T>
Matrix<T> Matrix<T>::operator+(const type &m) const
{
    return Matrix(*this)+=m;
}

/*
 * Subtruction of Matrices C=A-B
 */
template <class T>
Matrix<T> Matrix<T>::operator-(const type &m) const
{
    return Matrix(*this)-=m;
}

/*
 * Subtruction of Matrices A=A-B
 */
template <class T>
Matrix<T>& Matrix<T>::operator-=(const type &m)
{
    qint64 rc=this->getRowCount();
    qint64 cc=this->getColCount();

    assert(rc==m.getRowCount() && cc==m.getColCount());
    for(qint64 i=0; i<rc; i++)
        for(qint64 j=0;j<cc;j++)
            this->m_matrix_data[i][j]-=m.m_matrix_data[i][j];
    return *this;
}

/*
 *
 */
template <class T>
T& Matrix<T>::operator()(qint64 r, qint64 c)
{
    return this->getElement(r,c);
}

}//namespace


#endif

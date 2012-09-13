#ifndef _SAM_FILE_HEADER_
#define _SAM_FILE_HEADER_

#ifdef D_USE_SAM
#ifdef D_USE_BAM
#error "BAM and SAM cannot be defined together"
#endif
#endif

#include <config.hpp>

//#include <Reads.hpp>

//using namespace genome;

template <class Storage>
class SamReader
{

public:

	SamReader(Storage *o,QObject *parent=0);
	SamReader(QString,Storage *o,QObject *parent=0);

	~SamReader();

	void Load(void);

//protected:
//
//	virtual void onEntry(QEvent* event);

private:

	void initialize();

    QString inFile;
	Storage   *output;    

	QSet<int> tids;//t ids which should be twiced
	QSet<int> i_tids;//t ids which should be ignored

#ifdef D_USE_BAM
	BamMultiReader reader;
	SamHeader header;
	RefVector references;
#endif
#ifdef D_USE_SAM
	samfile_t *fp;
	bam1_t    *bamCore;
#endif
};

#include <SamReader.cpp>
#endif


